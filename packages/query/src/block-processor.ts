import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AuctionId } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import {
  PositionState,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Nullifier } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { ValidatorInfoResponse } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { Action } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { StateCommitment } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';
import { SpendableNoteRecord, SwapRecord } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { auctionIdFromBech32 } from '@penumbra-zone/bech32m/pauctid';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import {
  getExchangeRateFromValidatorInfoResponse,
  getIdentityKeyFromValidatorInfoResponse,
} from '@penumbra-zone/getters/validator-info-response';
import { toDecimalExchangeRate } from '@penumbra-zone/types/amount';
import { assetPatterns, PRICE_RELEVANCE_THRESHOLDS } from '@penumbra-zone/types/assets';
import type { BlockProcessorInterface } from '@penumbra-zone/types/block-processor';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import type { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import type { ViewServerInterface } from '@penumbra-zone/types/servers';
import { ScanBlockResult } from '@penumbra-zone/types/state-commitment-tree';
import { computePositionId, getLpNftMetadata } from '@penumbra-zone/wasm/dex';
import { customizeSymbol } from '@penumbra-zone/wasm/metadata';
import { backOff } from 'exponential-backoff';
import { updatePricesFromSwaps } from './helpers/price-indexer.js';
import { processActionDutchAuctionEnd } from './helpers/process-action-dutch-auction-end.js';
import { processActionDutchAuctionSchedule } from './helpers/process-action-dutch-auction-schedule.js';
import { processActionDutchAuctionWithdraw } from './helpers/process-action-dutch-auction-withdraw.js';
import { RootQuerier } from './root-querier.js';
import { IdentityKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { getDelegationTokenMetadata } from '@penumbra-zone/wasm/stake';
import { toPlainMessage } from '@bufbuild/protobuf';
import { getAssetIdFromGasPrices } from '@penumbra-zone/getters/compact-block';
import { getSpendableNoteRecordCommitment } from '@penumbra-zone/getters/spendable-note-record';
import { getSwapRecordCommitment } from '@penumbra-zone/getters/swap-record';
import { CompactBlock } from '@penumbra-zone/protobuf/penumbra/core/component/compact_block/v1/compact_block_pb';
import { shouldSkipTrialDecrypt } from './helpers/skip-trial-decrypt.js';
import { identifyTransactions, RelevantTx } from './helpers/identify-txs.js';

declare global {
  // eslint-disable-next-line no-var -- expected globals
  var __DEV__: boolean | undefined;
  // eslint-disable-next-line no-var -- expected globals
  var __ASSERT_ROOT__: boolean | undefined;
}

const isSwapRecordWithSwapCommitment = (
  r?: unknown,
): r is Exclude<SwapRecord, { swapCommitment: undefined }> =>
  r instanceof SwapRecord && r.swapCommitment instanceof StateCommitment;

const isSpendableNoteRecordWithNoteCommitment = (
  r?: unknown,
): r is Exclude<SpendableNoteRecord, { noteCommitment: undefined }> =>
  r instanceof SpendableNoteRecord && r.noteCommitment instanceof StateCommitment;

interface QueryClientProps {
  querier: RootQuerier;
  indexedDb: IndexedDbInterface;
  viewServer: ViewServerInterface;
  numeraires: AssetId[];
  stakingAssetId: AssetId;
  genesisBlock: CompactBlock | undefined;
  walletCreationBlockHeight: number | undefined;
}

interface ProcessBlockParams {
  compactBlock: CompactBlock;
  latestKnownBlockHeight: bigint;
  skipTrialDecrypt?: boolean;
}

const POSITION_STATES: PositionState[] = [
  new PositionState({ state: PositionState_PositionStateEnum.OPENED }),
  new PositionState({ state: PositionState_PositionStateEnum.CLOSED }),
  new PositionState({ state: PositionState_PositionStateEnum.WITHDRAWN, sequence: 0n }),
];

export class BlockProcessor implements BlockProcessorInterface {
  private readonly querier: RootQuerier;
  private readonly indexedDb: IndexedDbInterface;
  private readonly viewServer: ViewServerInterface;
  private readonly abortController: AbortController = new AbortController();
  private numeraires: AssetId[];
  private readonly stakingAssetId: AssetId;
  private syncPromise: Promise<void> | undefined;
  private readonly genesisBlock: CompactBlock | undefined;
  private readonly walletCreationBlockHeight: number | undefined;

  constructor({
    indexedDb,
    viewServer,
    querier,
    numeraires,
    stakingAssetId,
    genesisBlock,
    walletCreationBlockHeight,
  }: QueryClientProps) {
    this.indexedDb = indexedDb;
    this.viewServer = viewServer;
    this.querier = querier;
    this.numeraires = numeraires;
    this.stakingAssetId = stakingAssetId;
    this.genesisBlock = genesisBlock;
    this.walletCreationBlockHeight = walletCreationBlockHeight;
  }

  // If sync() is called multiple times concurrently, they'll all wait for
  // the same promise rather than each starting their own sync process.
  public sync = (): Promise<void> =>
    (this.syncPromise ??= backOff(() => this.syncAndStore(), {
      delayFirstAttempt: false,
      startingDelay: 5_000, // 5 seconds
      numOfAttempts: Infinity,
      maxDelay: 20_000, // 20 seconds
      retry: async (e, attemptNumber) => {
        console.error(`Sync failure #${attemptNumber}: `, e);
        await this.viewServer.resetTreeToStored();
        return !this.abortController.signal.aborted;
      },
    })).finally(
      // if the above promise completes, exponential backoff has ended (aborted).
      // reset the rejected promise to allow for a new sync to be started.
      () => (this.syncPromise = undefined),
    );

  public stop = (r: string) => this.abortController.abort(`Sync stop ${r}`);

  setNumeraires(numeraires: AssetId[]): void {
    this.numeraires = numeraires;
  }

  /**
   * Sync local state to present. This method will
   * - identify current synced height (or `-1n` to represent a 'pre-genesis' state)
   * - query remote rpc for the chain's latest block height
   * - pre-genesis, initialize validator info
   * - pre-genesis, process a local genesis block if provided
   * - query remote rpc to begin streaming at the next block
   * - iterate
   */
  private async syncAndStore() {
    // start at next block, or genesis if height is undefined
    let currentHeight = (await this.indexedDb.getFullSyncHeight()) ?? -1n;

    // this is the first network query of the block processor. use backoff to
    // delay until network is available
    let latestKnownBlockHeight = await backOff(
      async () => {
        const latest = await this.querier.tendermint.latestBlockHeight();
        if (!latest) {
          throw new Error('Unknown latest block height');
        }
        return latest;
      },
      { retry: () => true },
    );

    // special case genesis sync
    if (currentHeight === -1n) {
      // initialize validator info at genesis
      // TODO: use batch endpoint https://github.com/penumbra-zone/penumbra/issues/4688
      void this.updateValidatorInfos(currentHeight + 1n);

      // begin the chain with local genesis block if provided
      if (this.genesisBlock?.height === currentHeight + 1n) {
        currentHeight = this.genesisBlock.height;

        // Set the trial decryption flag for the genesis compact block
        const skipTrialDecrypt = shouldSkipTrialDecrypt(
          this.walletCreationBlockHeight,
          currentHeight,
        );

        await this.processBlock({
          compactBlock: this.genesisBlock,
          latestKnownBlockHeight: latestKnownBlockHeight,
          skipTrialDecrypt,
        });
      }
    }

    // this is an indefinite stream of the (compact) chain from the network
    // intended to run continuously
    for await (const compactBlock of this.querier.compactBlock.compactBlockRange({
      startHeight: currentHeight + 1n,
      keepAlive: true,
      abortSignal: this.abortController.signal,
    })) {
      // confirm block height to prevent corruption of local state
      if (compactBlock.height === currentHeight + 1n) {
        currentHeight = compactBlock.height;
      } else {
        throw new Error(`Unexpected block height: ${compactBlock.height} at ${currentHeight}`);
      }

      // Set the trial decryption flag for all other compact blocks
      const skipTrialDecrypt = shouldSkipTrialDecrypt(
        this.walletCreationBlockHeight,
        currentHeight,
      );

      await this.processBlock({
        compactBlock: compactBlock,
        latestKnownBlockHeight: latestKnownBlockHeight,
        skipTrialDecrypt,
      });

      // We only query Tendermint for the latest known block height once, when
      // the block processor starts running. Once we're caught up, though, the
      // chain will of course continue adding blocks, and we'll keep processing
      // them. So, we need to update `latestKnownBlockHeight` once we've passed
      // it.
      if (compactBlock.height > latestKnownBlockHeight) {
        latestKnownBlockHeight = compactBlock.height;
      }
    }
  }

  // logic for processing a compact block
  private async processBlock({
    compactBlock,
    latestKnownBlockHeight,
    skipTrialDecrypt = false,
  }: ProcessBlockParams) {
    if (compactBlock.appParametersUpdated) {
      await this.indexedDb.saveAppParams(await this.querier.app.appParams());
    }
    if (compactBlock.fmdParameters) {
      await this.indexedDb.saveFmdParams(compactBlock.fmdParameters);
    }
    if (compactBlock.gasPrices) {
      await this.indexedDb.saveGasPrices({
        ...toPlainMessage(compactBlock.gasPrices),
        assetId: toPlainMessage(this.stakingAssetId),
      });
    }
    if (compactBlock.altGasPrices.length) {
      for (const altGas of compactBlock.altGasPrices) {
        await this.indexedDb.saveGasPrices({
          ...toPlainMessage(altGas),
          assetId: getAssetIdFromGasPrices(altGas),
        });
      }
    }

    // wasm view server scan
    // - decrypts new notes
    // - decrypts new swaps
    // - updates idb with advice
    const scannerWantsFlush = await this.viewServer.scanBlock(compactBlock, skipTrialDecrypt);

    // flushing is slow, avoid it until
    // - wasm says
    // - every 1000th block
    // - every block at tip
    const flushReasons = {
      scannerWantsFlush,
      interval: compactBlock.height % 1000n === 0n,
      new: compactBlock.height > latestKnownBlockHeight,
    };

    const recordsByCommitment = new Map<StateCommitment, SpendableNoteRecord | SwapRecord>();
    let flush: ScanBlockResult | undefined;
    if (Object.values(flushReasons).some(Boolean)) {
      flush = this.viewServer.flushUpdates();

      // in an atomic query, this
      // - saves 'sctUpdates'
      // - saves new decrypted notes
      // - saves new decrypted swaps
      // - updates last block synced
      await this.indexedDb.saveScanResult(flush);

      // - detect unknown asset types
      // - shielded pool for asset metadata
      // - or, generate default fallback metadata
      // - update idb
      await this.identifyNewAssets(flush.newNotes);

      for (const spendableNoteRecord of flush.newNotes) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify non-null assertion
        recordsByCommitment.set(spendableNoteRecord.noteCommitment!, spendableNoteRecord);
      }
      for (const swapRecord of flush.newSwaps) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify non-null assertion
        recordsByCommitment.set(swapRecord.swapCommitment!, swapRecord);
      }
    }

    // nullifiers on this block may match notes or swaps from db
    // - update idb, mark as spent/claimed
    // - return nullifiers used in this way
    const spentNullifiers = await this.resolveNullifiers(
      compactBlock.nullifiers,
      compactBlock.height,
    );

    // if a new record involves a state commitment, scan all block tx
    if (spentNullifiers.size || recordsByCommitment.size) {
      // this is a network query
      const blockTx = await this.querier.app.txsByHeight(compactBlock.height);

      // Filter down to transactions & note records in block relevant to user
      const { relevantTxs, recoveredSourceRecords } = await identifyTransactions(
        spentNullifiers,
        recordsByCommitment,
        blockTx,
        addr => this.viewServer.isControlledAddress(addr),
      );

      // this simply stores the new records with 'rehydrated' sources to idb
      // TODO: this is the second time we save these records, after "saveScanResult"
      await this.saveRecoveredCommitmentSources(recoveredSourceRecords);

      await this.processTransactions(relevantTxs);

      // at this point txinfo can be generated and saved. this will resolve
      // pending broadcasts, and populate the transaction list.
      // - calls wasm for each relevant tx
      // - saves to idb
      await this.saveTransactions(compactBlock.height, relevantTxs);
    }

    /**
     * This... really isn't great.
     *
     * You can see above that we're already iterating over flush.newNotes. So
     * why don't we put this call to
     * `this.maybeUpsertAuctionWithNoteCommitment()` inside that earlier `for`
     * loop?
     *
     * The problem is, we need to call `this.processTransactions()` before
     * calling `this.maybeUpsertAuctionWithNoteCommitment()`, because
     * `this.processTransactions()` is what saves the auction NFT metadata to
     * the database. `this.maybeUpsertAuctionWithNoteCommitment()` depends on
     * that auction NFT metadata being saved already to be able to detect
     * whether a given note is for an auction NFT; only then will it save the
     * note's commitment to the `AUCTIONS` table.
     *
     * "So why not just move `this.processTransactions()` to before the block
     * where we handle `flush.newNotes`?" Because `this.processTransactions()`
     * should only run after we've handled `flush.newNotes`, since we depend
     * on the result of the flush to determine whether there are transactions
     * to process in the first place. It's a catch-22.
     *
     * This isn't a problem in core because core isn't going back and forth
     * between Rust and TypeScript like we are. If and when we move the block
     * processor into Rust, this issue should be resolved.
     */
    for (const spendableNoteRecord of flush?.newNotes ?? []) {
      await this.maybeUpsertAuctionWithNoteCommitment(spendableNoteRecord);
    }

    // We do not store historical prices,
    // so there is no point in saving prices that would already be considered obsolete at the time of saving
    const blockInPriceRelevanceThreshold =
      compactBlock.height >= latestKnownBlockHeight - BigInt(PRICE_RELEVANCE_THRESHOLDS.default);

    // we can't use third-party price oracles for privacy reasons,
    // so we have to get asset prices from swap results during block scans
    // and store them locally in indexed-db.
    if (blockInPriceRelevanceThreshold && compactBlock.swapOutputs.length) {
      await updatePricesFromSwaps(
        this.indexedDb,
        this.numeraires,
        compactBlock.swapOutputs,
        compactBlock.height,
      );
    }

    const isLastBlockOfEpoch = !!compactBlock.epochRoot;
    if (isLastBlockOfEpoch) {
      await this.handleEpochTransition(compactBlock.height, latestKnownBlockHeight);
    }

    if (globalThis.__ASSERT_ROOT__) {
      await this.assertRootValid(compactBlock.height);
    }
  }

  /*
   * Compares the locally stored, filtered TCT root with the actual one on chain. They should match.
   * This is expensive to do every block, so should only be done in development for debugging purposes.
   */
  private async assertRootValid(blockHeight: bigint): Promise<void> {
    const remoteRoot = await this.querier.cnidarium.fetchRemoteRoot(blockHeight);
    const inMemoryRoot = this.viewServer.getSctRoot();

    if (remoteRoot.equals(inMemoryRoot)) {
      console.debug(
        `Block height: ${blockHeight} root matches remote ✅ \n`,
        `Hash: ${uint8ArrayToHex(inMemoryRoot.inner)}`,
      );
    } else {
      console.warn(
        `Block height: ${blockHeight} root does not match remote ❌ \n`,
        `Local hash: ${uint8ArrayToHex(inMemoryRoot.inner)} \n`,
        `Remote hash: ${uint8ArrayToHex(remoteRoot.inner)}`,
      );
    }
  }

  private async saveRecoveredCommitmentSources(recovered: (SpendableNoteRecord | SwapRecord)[]) {
    for (const record of recovered) {
      if (isSpendableNoteRecordWithNoteCommitment(record)) {
        await this.indexedDb.saveSpendableNote({
          ...toPlainMessage(record),
          noteCommitment: toPlainMessage(getSpendableNoteRecordCommitment(record)),
        });
      } else if (isSwapRecordWithSwapCommitment(record)) {
        await this.indexedDb.saveSwap({
          ...toPlainMessage(record),
          swapCommitment: toPlainMessage(getSwapRecordCommitment(record)),
        });
      } else {
        throw new Error('Unexpected record type');
      }
    }
  }

  private async identifyNewAssets(notes: SpendableNoteRecord[]) {
    for (const note of notes) {
      const assetId = note.note?.value?.assetId;
      if (!assetId) {
        continue;
      }

      await this.saveAndReturnMetadata(assetId);
    }
  }

  // TODO: refactor. there is definitely a better way to do this.  batch
  // endpoint issue https://github.com/penumbra-zone/penumbra/issues/4688
  private async saveAndReturnMetadata(assetId: AssetId): Promise<Metadata | undefined> {
    const metadataAlreadyInDb = await this.indexedDb.getAssetsMetadata(assetId);
    if (metadataAlreadyInDb) {
      return metadataAlreadyInDb;
    }

    const metadataFromNode = await this.querier.shieldedPool.assetMetadataById(assetId);

    // do not save IBC token metadata that are not in the prax registry
    const isIbcAsset = metadataFromNode && assetPatterns.ibc.matches(metadataFromNode.display);

    if (metadataFromNode && !isIbcAsset) {
      const customized = customizeSymbol(metadataFromNode);
      await this.indexedDb.saveAssetsMetadata({
        ...customized,
        penumbraAssetId: getAssetId(customized),
      });
      return metadataFromNode;
    }

    return undefined;
  }

  private async saveAndReturnDelegationMetadata(
    identityKey: IdentityKey,
  ): Promise<Metadata | undefined> {
    const delegationTokenAssetId = new AssetId({
      altBaseDenom: `udelegation_${bech32mIdentityKey(identityKey)}`,
    });

    const metadataAlreadyInDb = await this.indexedDb.getAssetsMetadata(delegationTokenAssetId);
    if (metadataAlreadyInDb) {
      return metadataAlreadyInDb;
    }

    const generatedMetadata = getDelegationTokenMetadata(identityKey);

    const customized = customizeSymbol(generatedMetadata);
    await this.indexedDb.saveAssetsMetadata({
      ...customized,
      penumbraAssetId: getAssetId(customized),
    });
    return generatedMetadata;
  }

  // Nullifier is published in network when a note is spent or swap is claimed.
  private async resolveNullifiers(nullifiers: Nullifier[], height: bigint) {
    const spentNullifiers = new Set<Nullifier>();

    for (const nullifier of nullifiers) {
      const record =
        (await this.indexedDb.getSpendableNoteByNullifier(nullifier)) ??
        (await this.indexedDb.getSwapByNullifier(nullifier));
      if (!record) {
        continue;
      }

      spentNullifiers.add(nullifier);

      if (record instanceof SpendableNoteRecord) {
        record.heightSpent = height;
        await this.indexedDb.saveSpendableNote({
          ...toPlainMessage(record),
          noteCommitment: toPlainMessage(getSpendableNoteRecordCommitment(record)),
        });
      } else if (record instanceof SwapRecord) {
        record.heightClaimed = height;
        await this.indexedDb.saveSwap({
          ...toPlainMessage(record),
          swapCommitment: toPlainMessage(getSwapRecordCommitment(record)),
        });
      }
    }

    return spentNullifiers;
  }

  /**
   * Identify various pieces of data from the transaction that we need to save,
   * such as metadata, liquidity positions, etc.
   */
  private async processTransactions(txs: RelevantTx[]) {
    for (const { data } of txs) {
      for (const { action } of data.body?.actions ?? []) {
        await Promise.all([this.identifyAuctionNfts(action), this.identifyLpNftPositions(action)]);
      }
    }
  }

  /**
   * during wasm tx info generation later, wasm independently queries idb for
   * asset metadata, so we have to pre-populate. Auction NFTs aren't known by
   * the chain so aren't populated by identifyNewAssets.
   */
  private async identifyAuctionNfts(action: Action['action']) {
    if (action.case === 'actionDutchAuctionSchedule' && action.value.description) {
      await processActionDutchAuctionSchedule(action.value.description, this.indexedDb);
    } else if (action.case === 'actionDutchAuctionEnd' && action.value.auctionId) {
      await processActionDutchAuctionEnd(action.value, this.querier.auction, this.indexedDb);
    } else if (action.case === 'actionDutchAuctionWithdraw' && action.value.auctionId) {
      await processActionDutchAuctionWithdraw(
        action.value.auctionId,
        action.value.seq,
        this.indexedDb,
      );
    }
  }

  /**
   * during wasm tx info generation later, wasm independently queries idb for
   * asset metadata, so we have to pre-populate. LpNft position states aren't
   * known by the chain so aren't populated by identifyNewAssets
   * - detect LpNft position opens
   * - generate all possible position state metadata
   * - update idb
   */
  private async identifyLpNftPositions(action: Action['action']) {
    if (action.case === 'positionOpen' && action.value.position) {
      for (const state of POSITION_STATES) {
        const metadata = getLpNftMetadata(computePositionId(action.value.position), state);
        const customized = customizeSymbol(metadata);
        await this.indexedDb.saveAssetsMetadata({
          ...customized,
          penumbraAssetId: getAssetId(metadata),
        });
      }
      // to optimize on-chain storage PositionId is not written in the positionOpen action,
      // but can be computed via hashing of immutable position fields
      await this.indexedDb.addPosition(
        computePositionId(action.value.position),
        action.value.position,
      );
    }
    if (action.case === 'positionClose' && action.value.positionId) {
      await this.indexedDb.updatePosition(
        action.value.positionId,
        new PositionState({ state: PositionState_PositionStateEnum.CLOSED }),
      );
    }
    if (action.case === 'positionWithdraw' && action.value.positionId) {
      // Record the LPNFT for the current sequence number.
      const positionState = new PositionState({
        state: PositionState_PositionStateEnum.WITHDRAWN,
        sequence: action.value.sequence,
      });
      const metadata = getLpNftMetadata(action.value.positionId, positionState);
      const customized = customizeSymbol(metadata);
      await this.indexedDb.saveAssetsMetadata({
        ...customized,
        penumbraAssetId: getAssetId(metadata),
      });

      await this.indexedDb.updatePosition(action.value.positionId, positionState);
    }
  }

  private async maybeUpsertAuctionWithNoteCommitment(spendableNoteRecord: SpendableNoteRecord) {
    const assetId = spendableNoteRecord.note?.value?.assetId;
    if (!assetId) {
      return;
    }

    const metadata = await this.indexedDb.getAssetsMetadata(assetId);
    const captureGroups = assetPatterns.auctionNft.capture(metadata?.display ?? '');
    if (!captureGroups) {
      return;
    }

    const auctionId = new AuctionId(auctionIdFromBech32(captureGroups.auctionId));

    await this.indexedDb.upsertAuction(auctionId, {
      noteCommitment: spendableNoteRecord.noteCommitment,
    });
  }

  private async saveTransactions(height: bigint, relevantTx: RelevantTx[]) {
    for (const { id, data } of relevantTx) {
      await this.indexedDb.saveTransaction(id, height, data);
    }
  }

  private async handleEpochTransition(
    endHeightOfPreviousEpoch: bigint,
    latestKnownBlockHeight: bigint,
  ): Promise<void> {
    const nextEpochStartHeight = endHeightOfPreviousEpoch + 1n;
    await this.indexedDb.addEpoch(nextEpochStartHeight);

    const { sctParams } = (await this.indexedDb.getAppParams()) ?? {};
    const nextEpochIsLatestKnownEpoch =
      sctParams && latestKnownBlockHeight - nextEpochStartHeight < sctParams.epochDuration;

    // If we're doing a full sync from block 0, there could be hundreds or even
    // thousands of epoch transitions in the chain already. If we update
    // validator infos on every epoch transition, we'd be making tons of
    // unnecessary calls to the RPC node for validator infos. Instead, we'll
    // only get updated validator infos once we're within the latest known
    // epoch.
    if (nextEpochIsLatestKnownEpoch) {
      void this.updateValidatorInfos(nextEpochStartHeight);
    }
  }

  // TODO: refactor. there is definitely a better way to do this.  batch
  // endpoint issue https://github.com/penumbra-zone/penumbra/issues/4688
  private async updateValidatorInfos(nextEpochStartHeight: bigint): Promise<void> {
    // It's important to clear the table so any stale (jailed, tombstoned, etc) entries are filtered out.
    await this.indexedDb.clearValidatorInfos();

    for await (const validatorInfoResponse of this.querier.stake.allValidatorInfos()) {
      if (!validatorInfoResponse.validatorInfo) {
        continue;
      }

      await this.indexedDb.upsertValidatorInfo(validatorInfoResponse.validatorInfo);

      await this.updatePriceForValidatorDelegationToken(
        validatorInfoResponse,
        nextEpochStartHeight,
      );

      // this loop requests delegation token metadata for each validator
      // individually. there may be very many, so we must artificially delay
      // this loop or the RPC may hard-ratelimit us.
      await new Promise(
        resolve =>
          void setTimeout(
            resolve,
            // an entire second
            1000,
          ),
      );
    }
  }

  private async updatePriceForValidatorDelegationToken(
    validatorInfoResponse: ValidatorInfoResponse,
    nextEpochStartHeight: bigint,
  ) {
    const identityKey = getIdentityKeyFromValidatorInfoResponse(validatorInfoResponse);

    const metadata = await this.saveAndReturnDelegationMetadata(identityKey);

    if (metadata) {
      const assetId = getAssetId(metadata);
      const exchangeRate = getExchangeRateFromValidatorInfoResponse(validatorInfoResponse);

      await this.indexedDb.updatePrice(
        assetId,
        this.stakingAssetId,
        toDecimalExchangeRate(exchangeRate),
        nextEpochStartHeight,
      );
    }
  }
}
