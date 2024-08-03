import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { AuctionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb.js';
import {
  PositionState,
  PositionState_PositionStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb.js';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb.js';
import {
  CommitmentSource,
  Nullifier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb.js';
import {
  ValidatorInfo,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import {
  Action,
  Transaction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb.js';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb.js';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb.js';
import {
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { auctionIdFromBech32 } from '@penumbra-zone/bech32m/pauctid';
import { bech32mIdentityKey, identityKeyFromBech32m } from '@penumbra-zone/bech32m/penumbravalid';
import { sha256Hash } from '@penumbra-zone/crypto-web/sha256';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import {
  getExchangeRateFromValidatorInfo,
  getIdentityKeyFromValidatorInfo,
} from '@penumbra-zone/getters/validator-info';
import { toDecimalExchangeRate } from '@penumbra-zone/types/amount';
import { PRICE_RELEVANCE_THRESHOLDS, assetPatterns } from '@penumbra-zone/types/assets';
import type { BlockProcessorInterface } from '@penumbra-zone/types/block-processor';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import type { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import type { ViewServerInterface } from '@penumbra-zone/types/servers';
import { ScanBlockResult } from '@penumbra-zone/types/state-commitment-tree';
import { computePositionId, getLpNftMetadata } from '@penumbra-zone/wasm/dex';
import { customizeSymbol } from '@penumbra-zone/wasm/metadata';
import { getDelegationTokenMetadata } from '@penumbra-zone/wasm/stake';
import { backOff } from 'exponential-backoff';
import { updatePricesFromSwaps } from './helpers/price-indexer.js';
import { processActionDutchAuctionEnd } from './helpers/process-action-dutch-auction-end.js';
import { processActionDutchAuctionSchedule } from './helpers/process-action-dutch-auction-schedule.js';
import { processActionDutchAuctionWithdraw } from './helpers/process-action-dutch-auction-withdraw.js';
import { RootQuerier } from './root-querier.js';

declare global {
  // eslint-disable-next-line no-var
  var __DEV__: boolean | undefined;
  // eslint-disable-next-line no-var
  var __ASSERT_ROOT__: boolean | undefined;
}

const BLANK_TX_SOURCE = new CommitmentSource({
  source: { case: 'transaction', value: { id: new Uint8Array() } },
});

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
  private readonly nativeAsset: AssetId;
  private syncPromise: Promise<void> | undefined;

  constructor({
    indexedDb,
    viewServer,
    querier,
    numeraires,
    stakingAssetId: nativeAsset,
  }: {
    querier: RootQuerier;
    indexedDb: IndexedDbInterface;
    viewServer: ViewServerInterface;
    numeraires: AssetId[];
    stakingAssetId: AssetId;
  }) {
    this.indexedDb = indexedDb;
    this.viewServer = viewServer;
    this.querier = querier;
    this.numeraires = numeraires;
    this.nativeAsset = nativeAsset;
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
        if (globalThis.__DEV__) {
          console.debug('Sync failure', attemptNumber, e);
        }
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

    // TODO: init validator info in a better way, possibly after batch endpoint
    // implemented https://github.com/penumbra-zone/penumbra/issues/4688
    if (currentHeight === -1n) {
      // The main sync loop will only update validator info at modern epoch
      // transitions. If the client is syncing from genesis, that might be far
      // off, so some initial info is gathered here.
      void this.updateValidatorInfo(0n);
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

      if (compactBlock.appParametersUpdated) {
        await this.indexedDb.saveAppParams(await this.querier.app.appParams());
      }

      if (compactBlock.fmdParameters) {
        await this.indexedDb.saveFmdParams(compactBlock.fmdParameters);
      }

      if (compactBlock.gasPrices) {
        await this.indexedDb.saveGasPrices(
          new GasPrices({
            assetId: this.nativeAsset,
            ...compactBlock.gasPrices,
          }),
        );
      }

      if (compactBlock.altGasPrices.length) {
        for (const gasPrice of compactBlock.altGasPrices) {
          await this.indexedDb.saveGasPrices(gasPrice);
        }
      }

      // wasm view server scan
      // - decrypts new notes
      // - decrypts new swaps
      // - updates idb with advice
      const scannerWantsFlush = await this.viewServer.scanBlock(compactBlock);

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
          recordsByCommitment.set(spendableNoteRecord.noteCommitment!, spendableNoteRecord);
        }
        for (const swapRecord of flush.newSwaps) {
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

        // identify tx that involve a new record
        // - compare nullifiers
        // - compare state commitments
        // - collect relevant tx for info generation later
        // - if matched by commitment, collect record with recovered source
        const { relevantTx, recordsWithSources } = await this.identifyTransactions(
          spentNullifiers,
          recordsByCommitment,
          blockTx,
        );

        // this simply stores the new records with 'rehydrated' sources to idb
        // TODO: this is the second time we save these records, after "saveScanResult"
        await this.saveRecoveredCommitmentSources(recordsWithSources);

        await this.processTransactions(blockTx);

        // at this point txinfo can be generated and saved. this will resolve
        // pending broadcasts, and populate the transaction list.
        // - calls wasm for each relevant tx
        // - saves to idb
        await this.saveTransactions(compactBlock.height, relevantTx);
      }

      // this must execute after processTransactions, so it can query any
      // updated auction NFT metadata in idb.
      if (flush?.newNotes) {
        await this.updateAuctions(flush.newNotes);
      }

      if (
        // present swap outputs mean there are prices to update
        compactBlock.swapOutputs.length &&
        // only save prices that aren't already obsolete
        compactBlock.height >= latestKnownBlockHeight - BigInt(PRICE_RELEVANCE_THRESHOLDS.default)
      ) {
        await updatePricesFromSwaps(
          this.indexedDb,
          this.numeraires,
          compactBlock.swapOutputs,
          compactBlock.height,
        );
      }

      if (compactBlock.height > latestKnownBlockHeight) {
        latestKnownBlockHeight = compactBlock.height;
      }

      if (compactBlock.epochRoot) {
        await this.handleEpochTransition(compactBlock.height, latestKnownBlockHeight);
      }

      if (globalThis.__ASSERT_ROOT__) {
        await this.assertRootValid(compactBlock.height);
      }
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
      if (record instanceof SpendableNoteRecord) {
        await this.indexedDb.saveSpendableNote(record);
      } else if (record instanceof SwapRecord) {
        await this.indexedDb.saveSwap(record);
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

  private async identifyTransactions(
    spentNullifiers: Set<Nullifier>,
    commitmentRecordsByStateCommitment: Map<StateCommitment, SpendableNoteRecord | SwapRecord>,
    blockTx: Transaction[],
  ) {
    const relevantTx = new Map<TransactionId, Transaction>();
    const recordsWithSources = new Array<SpendableNoteRecord | SwapRecord>();
    for (const tx of blockTx) {
      let txId: TransactionId | undefined;

      const txCommitments = (tx.body?.actions ?? []).flatMap(({ action }) => {
        switch (action.case) {
          case 'output':
            return action.value.body?.notePayload?.noteCommitment;
          case 'swap':
            return action.value.body?.payload?.commitment;
          case 'swapClaim':
            return [action.value.body?.output1Commitment, action.value.body?.output2Commitment];
          default:
            return;
        }
      });

      const txNullifiers = (tx.body?.actions ?? []).map(({ action }) => {
        switch (action.case) {
          case 'spend':
          case 'swapClaim':
            return action.value.body?.nullifier;
          default:
            return;
        }
      });

      for (const spentNullifier of spentNullifiers) {
        if (txNullifiers.some(txNullifier => spentNullifier.equals(txNullifier))) {
          txId = new TransactionId({ inner: await sha256Hash(tx.toBinary()) });
          relevantTx.set(txId, tx);
          spentNullifiers.delete(spentNullifier);
        }
      }

      for (const [stateCommitment, spendableNoteRecord] of commitmentRecordsByStateCommitment) {
        if (txCommitments.some(txCommitment => stateCommitment.equals(txCommitment))) {
          txId ??= new TransactionId({ inner: await sha256Hash(tx.toBinary()) });
          relevantTx.set(txId, tx);
          if (BLANK_TX_SOURCE.equals(spendableNoteRecord.source)) {
            spendableNoteRecord.source = new CommitmentSource({
              source: { case: 'transaction', value: { id: txId.inner } },
            });
            recordsWithSources.push(spendableNoteRecord);
          }
          commitmentRecordsByStateCommitment.delete(stateCommitment);
        }
      }
    }
    return { relevantTx, recordsWithSources };
  }

  // TODO: refactor. there is definitely a better way to do this.  batch
  // endpoint issue https://github.com/penumbra-zone/penumbra/issues/4688
  private async saveAndReturnMetadata(assetId: AssetId): Promise<Metadata | undefined> {
    const metadataAlreadyInDb = await this.indexedDb.getAssetsMetadata(assetId);
    if (metadataAlreadyInDb) {
      return metadataAlreadyInDb;
    }

    const metadataFromNode = await this.querier.shieldedPool.assetMetadataById(assetId);

    //do not save IBC token metadata that are not in the prax registry
    const isIbcAsset = metadataFromNode && assetPatterns.ibc.matches(metadataFromNode.display);

    if (metadataFromNode && !isIbcAsset) {
      await this.indexedDb.saveAssetsMetadata(customizeSymbol(metadataFromNode));
      return metadataFromNode;
    }

    return undefined;
  }

  async saveAndReturnDelegationMetadata(identityKey: IdentityKey) {
    const delegationTokenAssetId = new AssetId({
      altBaseDenom: `udelegation_${bech32mIdentityKey(identityKey)}`,
    });

    const metadataAlreadyInDb = await this.indexedDb.getAssetsMetadata(delegationTokenAssetId);
    if (metadataAlreadyInDb) {
      return metadataAlreadyInDb;
    }

    const generatedMetadata = getDelegationTokenMetadata(identityKey);

    await this.indexedDb.saveAssetsMetadata(customizeSymbol(generatedMetadata));
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
        await this.indexedDb.saveSpendableNote(record);
      } else if (record instanceof SwapRecord) {
        record.heightClaimed = height;
        await this.indexedDb.saveSwap(record);
      }
    }

    return spentNullifiers;
  }

  /**
   * Identify various pieces of data from the transaction that we need to save,
   * such as metadata, liquidity positions, etc.
   */
  private async processTransactions(txs: Transaction[]) {
    for (const tx of txs) {
      for (const { action } of tx.body?.actions ?? []) {
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
        await this.indexedDb.saveAssetsMetadata(metadata);
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
      await this.indexedDb.saveAssetsMetadata(metadata);

      await this.indexedDb.updatePosition(action.value.positionId, positionState);
    }
  }

  /**
   * Detect auction NFTs and update the relevant auction records.
   */
  private async updateAuctions(newNotes: SpendableNoteRecord[]) {
    for (const { noteCommitment, note } of newNotes) {
      const metadata =
        note?.value?.assetId && (await this.indexedDb.getAssetsMetadata(note.value.assetId));
      const auctionIdString =
        metadata?.display && assetPatterns.auctionNft.capture(metadata.display)?.auctionId;
      if (auctionIdString) {
        const auctionId = new AuctionId(auctionIdFromBech32(auctionIdString));
        await this.indexedDb.upsertAuction(auctionId, { noteCommitment });
      }
    }
  }

  private async saveTransactions(height: bigint, relevantTx: Map<TransactionId, Transaction>) {
    for (const [id, transaction] of relevantTx) {
      await this.indexedDb.saveTransaction(id, height, transaction);
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

    // validator info is only updated at modern epochs for performance reasons
    if (nextEpochIsLatestKnownEpoch) {
      void this.updateValidatorInfo(nextEpochStartHeight);
    }
  }

  /**
   * At the end of an epoch, update validator info to reflect current validator
   * state and delegation token prices.
   *
   * Unfortunately, the current batch validator request endpoint only returns
   * 'ACTIVE' or 'INACTIVE' validators, meaning if a validator has transitioned
   * into a different state, it won't be updated.
   *
   * So, all known validators are iterated, and expected 'ACTIVE' or 'INACTIVE'
   * validators missing from the update are checked individually.
   *
   * @see https://github.com/penumbra-zone/web/issues/1453
   * @see https://github.com/penumbra-zone/penumbra/issues/4723
   */
  async updateValidatorInfo(nextEpochStartHeight: bigint): Promise<void> {
    const getKnownValidators = this.indexedDb.iterateValidatorInfos();
    const getCurrentValidators = this.querier.stake.validatorInfo({ showInactive: true });

    const currentValidators = new Map(
      (await Array.fromAsync(getCurrentValidators))
        .filter(({ validatorInfo }) => validatorInfo)
        .map(({ validatorInfo }) => [
          bech32mIdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo)),
          validatorInfo!,
        ]),
    );

    const expectedValidators = new Map(
      (await Array.fromAsync(getKnownValidators))
        .filter(
          ({ status }) =>
            status?.state?.state &&
            [
              ValidatorState_ValidatorStateEnum.ACTIVE,
              ValidatorState_ValidatorStateEnum.INACTIVE,
            ].includes(status.state.state),
        )
        .map(validatorInfo => [
          bech32mIdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo)),
          validatorInfo,
        ]),
    );

    const currentValidatorSet = new Set(currentValidators.keys());
    const expectedValidatorSet = new Set(expectedValidators.keys());
    const missingValidatorSet = expectedValidatorSet.difference(currentValidatorSet);

    for await (const missingValidatorKey of missingValidatorSet) {
      const { validatorInfo } = await this.querier.stake.getValidatorInfo({
        identityKey: identityKeyFromBech32m(missingValidatorKey),
      });
      if (validatorInfo) {
        await this.indexedDb.upsertValidatorInfo(validatorInfo);
        void this.updateValidatorDelegationPrice(validatorInfo, nextEpochStartHeight);
      } else {
        const noValidatorInfo = expectedValidators.get(missingValidatorKey)!.clone();
        // set state to "UNSPECIFIED", since there is no state information anywhere
        noValidatorInfo.status!.state!.state = ValidatorState_ValidatorStateEnum.UNSPECIFIED;
        await this.indexedDb.upsertValidatorInfo(noValidatorInfo);
      }
    }

    for await (const validatorInfo of currentValidators.values()) {
      await this.indexedDb.upsertValidatorInfo(validatorInfo);
      void this.updateValidatorDelegationPrice(validatorInfo, nextEpochStartHeight);
    }
  }

  /**
   * Validator info contains exchange rate (price info) for the validator's
   * delegation token. Prices are tracked for all known validators.
   */
  async updateValidatorDelegationPrice(validatorInfo: ValidatorInfo, nextEpochStartHeight: bigint) {
    await this.indexedDb.updatePrice(
      getAssetId(
        await this.saveAndReturnDelegationMetadata(getIdentityKeyFromValidatorInfo(validatorInfo)),
      ),
      this.nativeAsset,
      toDecimalExchangeRate(getExchangeRateFromValidatorInfo(validatorInfo)),
      nextEpochStartHeight,
    );
  }
}
