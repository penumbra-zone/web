import { RootQuerier } from './root-querier';

import { bech32 } from 'bech32';

import { sha256Hash } from '@penumbra-zone/crypto-web';
import {
  BlockProcessorInterface,
  IndexedDbInterface,
  ViewServerInterface,
} from '@penumbra-zone/types';
import { computePositionId, decodeSctRoot, transactionInfo } from '@penumbra-zone/wasm-ts';

import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  PositionState,
  PositionState_PositionStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1alpha1/dex_pb';
import {
  CommitmentSource,
  Nullifier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';
import {
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { backOff } from 'exponential-backoff';

interface QueryClientProps {
  fullViewingKey: string;
  querier: RootQuerier;
  indexedDb: IndexedDbInterface;
  viewServer: ViewServerInterface;
}

const blankTxSource = new CommitmentSource({
  source: { case: 'transaction', value: { id: new Uint8Array() } },
});

export class BlockProcessor implements BlockProcessorInterface {
  private readonly fullViewingKey: string;
  private readonly querier: RootQuerier;
  private readonly indexedDb: IndexedDbInterface;
  private readonly viewServer: ViewServerInterface;
  private readonly abortController: AbortController = new AbortController();
  private syncPromise: Promise<void> | undefined;

  constructor({ indexedDb, viewServer, querier, fullViewingKey }: QueryClientProps) {
    this.fullViewingKey = fullViewingKey;
    this.indexedDb = indexedDb;
    this.viewServer = viewServer;
    this.querier = querier;
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
    commitmentRecords: Map<StateCommitment, SpendableNoteRecord | SwapRecord>,
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

      for (const spentNf of spentNullifiers) {
        if (txNullifiers.some(txNf => spentNf.equals(txNf))) {
          txId = new TransactionId({ inner: await sha256Hash(tx.toBinary()) });
          relevantTx.set(txId, tx);
          spentNullifiers.delete(spentNf);
        }
      }

      for (const [recCom, record] of commitmentRecords) {
        if (txCommitments.some(txCom => recCom.equals(txCom))) {
          txId ??= new TransactionId({ inner: await sha256Hash(tx.toBinary()) });
          relevantTx.set(txId, tx);
          if (blankTxSource.equals(record.source)) {
            record.source = new CommitmentSource({
              source: { case: 'transaction', value: { id: txId.inner } },
            });
            recordsWithSources.push(record);
          }
          commitmentRecords.delete(recCom);
        }
      }
    }
    return { relevantTx, recordsWithSources };
  }

  private async syncAndStore() {
    const lastBlockSynced = await this.indexedDb.getLastBlockSynced();
    const startHeight = lastBlockSynced ? lastBlockSynced + 1n : 0n;
    const latestBlockHeight = await this.querier.tendermint.latestBlockHeight();

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
        new: compactBlock.height > latestBlockHeight,
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

        for (const nr of flush.newNotes) recordsByCommitment.set(nr.noteCommitment!, nr);
        for (const sr of flush.newSwaps) recordsByCommitment.set(sr.swapCommitment!, sr);
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
        await this.saveTransactionInfos(compactBlock.height, relevantTx);
      }
    }
  }

  private async saveRecoveredCommitmentSources(recovered: (SpendableNoteRecord | SwapRecord)[]) {
    for (const record of recovered)
      if (record instanceof SpendableNoteRecord) await this.indexedDb.saveSpendableNote(record);
      else if (record instanceof SwapRecord) await this.indexedDb.saveSwap(record);
      else throw new Error('Unexpected record type');
  }

  private async identifyNewAssets(newNotes: SpendableNoteRecord[]) {
    for (const n of newNotes) {
      const assetId = n.note?.value?.assetId;
      if (!assetId) continue;
      if (await this.indexedDb.getAssetsMetadata(assetId)) continue;

      let metadata: Metadata | undefined;
      metadata = await this.querier.shieldedPool.assetMetadata(assetId);

      if (!metadata) {
        const UNNAMED_ASSET_PREFIX = 'passet';
        const denom = bech32.encode(UNNAMED_ASSET_PREFIX, bech32.toWords(assetId.inner));
        metadata = new Metadata({
          base: denom,
          denomUnits: [{ aliases: [], denom, exponent: 0 }],
          display: denom,
          penumbraAssetId: assetId,
        });
      }

      await this.indexedDb.saveAssetsMetadata(metadata);
    }
  }

  // Nullifier is published in network when a note is spent or swap is claimed.
  private async resolveNullifiers(nullifiers: Nullifier[], height: bigint) {
    const spentNullifiers = new Set<Nullifier>();

    for (const nf of nullifiers) {
      const record =
        (await this.indexedDb.getSpendableNoteByNullifier(nf)) ??
        (await this.indexedDb.getSwapByNullifier(nf));
      if (!record) continue;

      spentNullifiers.add(nf);

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
    const positionStates = [
      PositionState_PositionStateEnum.OPENED,
      PositionState_PositionStateEnum.CLOSED,
      PositionState_PositionStateEnum.WITHDRAWN,
      PositionState_PositionStateEnum.CLAIMED,
    ];

    for (const tx of txs) {
      for (const { action } of tx.body?.actions ?? []) {
        if (action.case === 'positionOpen' && action.value.position) {
          for (const state of positionStates) {
            const positionState = new PositionState({ state });
            const metadata = this.viewServer.getLpNftMetadata(action.value.position, positionState);
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
          await this.indexedDb.updatePosition(
            action.value.positionId,
            new PositionState({ state: PositionState_PositionStateEnum.WITHDRAWN }),
          );
        }
        if (action.case === 'positionRewardClaim' && action.value.positionId) {
          await this.indexedDb.updatePosition(
            action.value.positionId,
            new PositionState({ state: PositionState_PositionStateEnum.CLAIMED }),
          );
        }
      }
    }
  }

  private async saveTransactionInfos(height: bigint, relevantTx: Map<TransactionId, Transaction>) {
    for (const [id, transaction] of relevantTx) {
      const { txp: perspective, txv: view } = await transactionInfo(
        this.fullViewingKey,
        transaction,
        this.indexedDb.constants(),
      );
      await this.indexedDb.saveTransactionInfo(
        new TransactionInfo({
          height,
          id,
          transaction,
          perspective,
          view,
        }),
      );
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
}
