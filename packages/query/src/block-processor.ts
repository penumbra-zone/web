import { RootQuerier } from './root-querier';
import { sha256Hash } from '@penumbra-zone/crypto-web/src/sha256';
import { computePositionId, getLpNftMetadata } from '@penumbra-zone/wasm/src/dex';
import { decodeSctRoot } from '@penumbra-zone/wasm/src/sct';

import {
  getExchangeRateFromValidatorInfoResponse,
  getIdentityKeyFromValidatorInfoResponse,
} from '@penumbra-zone/getters/src/validator-info-response';
import {
  PositionState,
  PositionState_PositionStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import {
  CommitmentSource,
  Nullifier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import {
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { backOff } from 'exponential-backoff';
import type { BlockProcessorInterface } from '@penumbra-zone/types/src/block-processor';
import type { IndexedDbInterface } from '@penumbra-zone/types/src/indexed-db';
import type { ViewServerInterface } from '@penumbra-zone/types/src/servers';
import { customizeSymbol } from '@penumbra-zone/types/src/customize-symbol';
import { updatePricesFromSwaps } from './price-indexer';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { bech32IdentityKey } from '@penumbra-zone/bech32/src/identity-key';
import { getAssetId } from '@penumbra-zone/getters/src/metadata';
import { STAKING_TOKEN_METADATA } from '@penumbra-zone/constants/src/assets';
import { toDecimalExchangeRate } from '@penumbra-zone/types/src/amount';
import { ValidatorInfoResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';

interface QueryClientProps {
  querier: RootQuerier;
  indexedDb: IndexedDbInterface;
  viewServer: ViewServerInterface;
  numeraireAssetId: string;
}

const blankTxSource = new CommitmentSource({
  source: { case: 'transaction', value: { id: new Uint8Array() } },
});

export class BlockProcessor implements BlockProcessorInterface {
  private readonly querier: RootQuerier;
  private readonly indexedDb: IndexedDbInterface;
  private readonly viewServer: ViewServerInterface;
  private readonly abortController: AbortController = new AbortController();
  private readonly numeraireAssetId: string;
  private syncPromise: Promise<void> | undefined;

  constructor({ indexedDb, viewServer, querier, numeraireAssetId }: QueryClientProps) {
    this.indexedDb = indexedDb;
    this.viewServer = viewServer;
    this.querier = querier;
    this.numeraireAssetId = numeraireAssetId;
  }

  // If syncBlocks() is called multiple times concurrently, they'll all wait for
  // the same promise rather than each starting their own sync process.
  public sync(): Promise<void> {
    this.syncPromise ??= backOff(() => this.syncAndStore(), {
      maxDelay: 30_000, // 30 seconds
      retry: async (e, attemptNumber) => {
        console.warn('Sync failure', attemptNumber, e);
        await this.viewServer.resetTreeToStored();
        return !this.abortController.signal.aborted;
      },
    });
    return this.syncPromise;
  }

  public stop(r: string) {
    this.abortController.abort(`Sync abort ${r}`);
  }

  async identifyTransactions(
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
          default: // TODO: what other actions have commitments?
            return;
        }
      });

      const txNullifiers = (tx.body?.actions ?? []).map(({ action }) => {
        switch (action.case) {
          case 'spend':
          case 'swapClaim':
            return action.value.body?.nullifier;
          default: // TODO: what other actions have nullifiers?
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
          if (blankTxSource.equals(spendableNoteRecord.source)) {
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

  private async syncAndStore() {
    const fullSyncHeight = await this.indexedDb.getFullSyncHeight();
    const startHeight = fullSyncHeight ? fullSyncHeight + 1n : 0n;
    let latestKnownBlockHeight = await this.querier.tendermint.latestBlockHeight();

    if (startHeight === 0n) {
      // In the `for` loop below, we only update validator infos once we've
      // reached the latest known epoch. This means that, if a user is syncing
      // for the first time, they could experience a broken UI until the latest
      // known epoch is reached, since they may have delegation tokens but no
      // validator info to go with them. So we'll update validator infos at the
      // beginning of sync as well, and force the rest of sync to wait until
      // it's done.
      await this.updateValidatorInfos(0n);
    }

    // this is an indefinite stream of the (compact) chain from the network
    // intended to run continuously
    for await (const compactBlock of this.querier.compactBlock.compactBlockRange({
      startHeight,
      keepAlive: true,
      abortSignal: this.abortController.signal,
    })) {
      if (compactBlock.appParametersUpdated) {
        await this.indexedDb.saveAppParams(await this.querier.app.appParams());
      }
      if (compactBlock.fmdParameters) {
        await this.indexedDb.saveFmdParams(compactBlock.fmdParameters);
      }
      if (compactBlock.gasPrices) {
        await this.indexedDb.saveGasPrices(compactBlock.gasPrices);
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
      if (Object.values(flushReasons).some(Boolean)) {
        const flush = this.viewServer.flushUpdates();

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

        for (const spendableNoteRecord of flush.newNotes)
          recordsByCommitment.set(spendableNoteRecord.noteCommitment!, spendableNoteRecord);
        for (const swapRecord of flush.newSwaps)
          recordsByCommitment.set(swapRecord.swapCommitment!, swapRecord);
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

        // during wasm tx info generation later, wasm independently queries idb
        // for asset metadata, so we have to pre-populate. LpNft position states
        // aren't known by the chain so aren't populated by identifyNewAssets
        // - detect LpNft position opens
        // - generate all possible position state metadata
        // - update idb
        await this.identifyLpNftPositions(blockTx);

        // at this point txinfo can be generated and saved. this will resolve
        // pending broadcasts, and populate the transaction list.
        // - calls wasm for each relevant tx
        // - saves to idb
        await this.saveTransactions(compactBlock.height, relevantTx);
      }

      // we can't use third-party price oracles for privacy reasons,
      // so we have to get asset prices from swap results during block scans
      // and store them locally in indexed-db.
      if (compactBlock.swapOutputs.length) {
        await updatePricesFromSwaps(
          this.indexedDb,
          this.numeraireAssetId,
          compactBlock.swapOutputs,
          compactBlock.height,
        );
      }

      // We only query Tendermint for the latest known block height once, when
      // the block processor starts running. Once we're caught up, though, the
      // chain will of course continue adding blocks, and we'll keep processing
      // them. So, we need to update `latestKnownBlockHeight` once we've passed
      // it.
      if (compactBlock.height > latestKnownBlockHeight) {
        latestKnownBlockHeight = compactBlock.height;
      }

      const isLastBlockOfEpoch = !!compactBlock.epochRoot;
      if (isLastBlockOfEpoch) {
        await this.handleEpochTransition(compactBlock.height, latestKnownBlockHeight);
      }
    }
  }

  private async saveRecoveredCommitmentSources(recovered: (SpendableNoteRecord | SwapRecord)[]) {
    for (const record of recovered)
      if (record instanceof SpendableNoteRecord) await this.indexedDb.saveSpendableNote(record);
      else if (record instanceof SwapRecord) await this.indexedDb.saveSwap(record);
      else throw new Error('Unexpected record type');
  }

  private async identifyNewAssets(notes: SpendableNoteRecord[]) {
    for (const note of notes) {
      const assetId = note.note?.value?.assetId;
      if (!assetId) continue;

      await this.saveAndReturnMetadata(assetId);
    }
  }

  private async saveAndReturnMetadata(assetId: AssetId): Promise<Metadata | undefined> {
    const metadataAlreadyInDb = await this.indexedDb.getAssetsMetadata(assetId);
    if (metadataAlreadyInDb) return metadataAlreadyInDb;

    const metadataFromNode = await this.querier.shieldedPool.assetMetadataById(assetId);

    if (metadataFromNode) {
      await this.indexedDb.saveAssetsMetadata(customizeSymbol(metadataFromNode));
      return metadataFromNode;
    }

    return undefined;
  }

  // Nullifier is published in network when a note is spent or swap is claimed.
  private async resolveNullifiers(nullifiers: Nullifier[], height: bigint) {
    const spentNullifiers = new Set<Nullifier>();

    for (const nullifier of nullifiers) {
      const record =
        (await this.indexedDb.getSpendableNoteByNullifier(nullifier)) ??
        (await this.indexedDb.getSwapByNullifier(nullifier));
      if (!record) continue;

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

  private async identifyLpNftPositions(txs: Transaction[]) {
    const positionStates: PositionState[] = [
      new PositionState({ state: PositionState_PositionStateEnum.OPENED }),
      new PositionState({ state: PositionState_PositionStateEnum.CLOSED }),
      new PositionState({ state: PositionState_PositionStateEnum.WITHDRAWN, sequence: 0n }),
    ];

    for (const tx of txs) {
      for (const { action } of tx.body?.actions ?? []) {
        if (action.case === 'positionOpen' && action.value.position) {
          for (const state of positionStates) {
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
    }
  }

  private async saveTransactions(height: bigint, relevantTx: Map<TransactionId, Transaction>) {
    for (const [id, transaction] of relevantTx) {
      await this.indexedDb.saveTransaction(id, height, transaction);
    }
  }

  // Compares the locally stored, filtered SCT root with the actual one on chain. They should match.
  // This is expensive to do every block, so should only be done in development.
  // @ts-expect-error Only used ad-hoc in dev
  private async assertRootValid(blockHeight: bigint): Promise<void> {
    const sourceOfTruth = await this.querier.cnidarium.keyValue(`sct/anchor/${blockHeight}`);
    const inMemoryRoot = this.viewServer.getSctRoot();

    if (!decodeSctRoot(sourceOfTruth).equals(inMemoryRoot)) {
      throw new Error(
        `Block height: ${blockHeight}. Wasm root does not match remote source of truth. Programmer error.`,
      );
    }
  }

  private async handleEpochTransition(
    endHeightOfPreviousEpoch: bigint,
    latestKnownBlockHeight: bigint,
  ): Promise<void> {
    const { sctParams } = await this.querier.app.appParams();
    const nextEpochStartHeight = endHeightOfPreviousEpoch + 1n;

    await this.indexedDb.addEpoch(nextEpochStartHeight);

    const nextEpochIsLatestKnownEpoch =
      sctParams && latestKnownBlockHeight - nextEpochStartHeight < sctParams.epochDuration;

    // If we're doing a full sync from block 0, there could be hundreds or even
    // thousands of epoch transitions in the chain already. If we update
    // validator infos on every epoch transition, we'd be making tons of
    // unnecessary calls to the RPC node for validator infos. Instead, we'll
    // only get updated validator infos once we're within the latest known
    // epoch.
    if (nextEpochIsLatestKnownEpoch) void this.updateValidatorInfos(nextEpochStartHeight);
  }

  private async updateValidatorInfos(nextEpochStartHeight: bigint): Promise<void> {
    for await (const validatorInfoResponse of this.querier.staking.allValidatorInfos()) {
      if (!validatorInfoResponse.validatorInfo) continue;

      // Await the upsert. This makes it possible for users of this method to
      // await the entire method, if they want to block all other code until all
      // validator infos have been upserted.
      await this.indexedDb.upsertValidatorInfo(validatorInfoResponse.validatorInfo);

      // Don't await this, though -- price equivalents for delegation tokens are
      // non-critical, and shouldn't block the rest of the block processor.
      void this.updatePriceForValidatorDelegationToken(validatorInfoResponse, nextEpochStartHeight);
    }
  }

  private async updatePriceForValidatorDelegationToken(
    validatorInfoResponse: ValidatorInfoResponse,
    nextEpochStartHeight: bigint,
  ) {
    const identityKey = getIdentityKeyFromValidatorInfoResponse(validatorInfoResponse);
    const delegationTokenAssetId = new AssetId({
      altBaseDenom: `udelegation_${bech32IdentityKey(identityKey)}`,
    });

    const metadata = await this.saveAndReturnMetadata(delegationTokenAssetId);

    if (metadata) {
      const assetId = getAssetId(metadata);
      const stakingAssetId = getAssetId(STAKING_TOKEN_METADATA);
      const exchangeRate = getExchangeRateFromValidatorInfoResponse(validatorInfoResponse);

      await this.indexedDb.updatePrice(
        assetId,
        stakingAssetId,
        toDecimalExchangeRate(exchangeRate),
        nextEpochStartHeight,
      );
    }
  }
}
