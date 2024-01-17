import { RootQuerier } from './root-querier';

import { Code, ConnectError } from '@connectrpc/connect';
import { bech32 } from 'bech32';
import { backOff } from 'exponential-backoff';

import { sha256Hash } from '@penumbra-zone/crypto-web';
import {
  BlockProcessorInterface,
  IndexedDbInterface,
  StoreCommitment,
  ViewServerInterface,
} from '@penumbra-zone/types';
import { decodeSctRoot, transactionInfo } from '@penumbra-zone/wasm-ts';

import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  PositionState,
  PositionState_PositionStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1alpha1/dex_pb';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';
import {
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';

interface QueryClientProps {
  fullViewingKey: string;
  querier: RootQuerier;
  indexedDb: IndexedDbInterface;
  viewServer: ViewServerInterface;
}

export class BlockProcessor implements BlockProcessorInterface {
  private readonly fullViewingKey: string;
  private readonly querier: RootQuerier;
  private readonly indexedDb: IndexedDbInterface;
  private readonly viewServer: ViewServerInterface;
  private readonly abortController: AbortController = new AbortController();
  private blockSyncPromise: Promise<void> | undefined;

  constructor({ indexedDb, viewServer, querier, fullViewingKey }: QueryClientProps) {
    this.fullViewingKey = fullViewingKey;
    this.indexedDb = indexedDb;
    this.viewServer = viewServer;
    this.querier = querier;
  }

  // If syncBlocks() is called multiple times concurrently,
  // they'll all wait for the same promise rather than each starting their own sync process.
  async syncBlocks(): Promise<void> {
    if (!this.blockSyncPromise) {
      this.blockSyncPromise = this.autoRetrySync();
    }
    return this.blockSyncPromise;
  }

  // After a failure, retrying the sync is critical. An exponential-backoff is used.
  async autoRetrySync() {
    try {
      await backOff(() => this.syncAndStore(), {
        maxDelay: 30_000, // 30 seconds
        retry: async error => {
          await this.viewServer.resetTreeToStored();
          if (isAbortSignal(error)) return false;
          console.error('Syncing error', error);
          return true;
        },
      });
    } catch {
      // Was signaled to abort, can swallow this error
    }
  }

  stopSync() {
    this.abortController.abort();
  }

  private async syncAndStore() {
    const lastBlockSynced = await this.indexedDb.getLastBlockSynced();
    const startHeight = lastBlockSynced ? lastBlockSynced + 1n : 0n;
    const latestBlockHeight = await this.querier.tendermint.latestBlockHeight();

    // this is an indefinite stream of the (compact) chain from the network
    // intended to run continuously
    const start = performance.mark('start');
    for await (const compactBlock of this.querier.compactBlock.compactBlockRange({
      startHeight,
      keepAlive: true,
      abortSignal: this.abortController.signal,
    })) {
      if (compactBlock.fmdParameters)
        await this.indexedDb.saveFmdParams(compactBlock.fmdParameters);

      if (compactBlock.gasPrices) await this.indexedDb.saveGasPrices(compactBlock.gasPrices);

      // wasm view server scan
      // - decrypts new notes
      // - decrypts new swaps
      // - updates idb with advice
      //const shouldStoreProgress = await this.viewServer.scanBlock(compactBlock);
      const wasmWantsFlush = await this.viewServer.scanBlock(compactBlock);

      // flushing is slow, avoid it until
      // - wasm says
      // - every 1000th block
      // - every block at tip
      const flushReasons = {
        wasmWantsFlush,
        interval: compactBlock.height % 1000n === 0n,
        new: compactBlock.height > latestBlockHeight,
      };

      if (flushReasons.new) console.log('finished sync', performance.measure('start'));

      let compactScan;
      if (Object.values(flushReasons).some(Boolean)) {
        compactScan = this.viewServer.flushUpdates();
        console.log('flush', compactBlock, flushReasons, compactScan);

        // in an atomic query, this
        // - saves 'sctUpdates'
        // - saves new decrypted notes
        // - saves new decrypted swaps
        // - updates last block synced
        await this.indexedDb.saveScanResult(compactScan);

        // - detect unknown asset types, query the chain for asset metadata
        // - or, generate default fallback metadata
        // - update idb
        // this makes a network query.
        // TODO: should this be scanning swaps as well?
        await this.identifyNewAssets(compactScan.newNotes);
      }

      // nullifiers on this block may match notes or swaps from db
      // mark them as spent/claimed, return what was used
      const spentNullifiers = await this.resolveNullifiers(
        compactBlock.nullifiers,
        compactBlock.height,
      );
      // commitments on this block?? idk man
      const commitmentRecords = await this.resolveCommitments(
        compactScan?.sctUpdates.store_commitments,
      );

      const fullScanReasons = {
        'spent nullifiers': spentNullifiers.size,
        'updated commitments': commitmentRecords.size,
        'new notes': compactScan?.newNotes.length,
        'new swaps': compactScan?.newSwaps.length,
      };

      if (Object.values(fullScanReasons).some(Boolean)) {
        console.log('full scan', compactBlock.height, fullScanReasons);

        // this is a network query
        const fullBlock = await this.querier.app.txsByHeight(compactBlock.height);

        const relevantTx = await this.identifyRelevantTransactions(
          Array.from(spentNullifiers.keys()),
          Array.from(commitmentRecords.keys()),
          fullBlock.transactions,
        );

        console.warn('relevantTx', relevantTx.length);

        // during wasm tx info generation later, wasm independently queries
        // database for asset metadata, so we have to pre-populate. LpNft
        // position states aren't known by the chain so aren't poulated by
        // identifyNewAssets
        // - detect LpNft position opens, and generate all possible position state metadata
        // - update idb
        await this.identifyLpNftPositions(fullBlock.transactions);

        // at this point txinfo can be generated and saved. this will resolve
        // pending broadcasts, and populate the transaction list.
        // - calls wasm for each relevant tx
        // - saves to idb
        await this.saveTransactionInfo(compactBlock.height, relevantTx);
      }
    }
  }

  private async identifyNewAssets(newNotes: SpendableNoteRecord[]) {
    for (const n of newNotes) {
      const assetId = n.note?.value?.assetId;
      if (!assetId) continue;
      if (await this.indexedDb.getAssetsMetadata(assetId)) continue;

      let metadata;
      metadata = await this.querier.shieldedPool.denomMetadata(assetId);

      if (!metadata) {
        const UNNAMED_ASSET_PREFIX = 'passet';
        const denom = bech32.encode(UNNAMED_ASSET_PREFIX, bech32.toWords(assetId.inner));
        metadata = new DenomMetadata({
          base: denom,
          denomUnits: [{ aliases: [], denom, exponent: 0 }],
          display: denom,
          penumbraAssetId: assetId,
        });
      }

      await this.indexedDb.saveAssetsMetadata(metadata);
    }
  }

  private async resolveCommitments(commitments?: StoreCommitment[]) {
    const records = new Map<StateCommitment, SwapRecord | SpendableNoteRecord>();

    // - match commitments to idb notes/swaps
    for (const storeCommitment of commitments ?? []) {
      const stateCommitment = StateCommitment.fromJson(storeCommitment.commitment);
      const record =
        (await this.indexedDb.getSpendableNoteByCommitment(stateCommitment)) ??
        (await this.indexedDb.getSwapByCommitment(stateCommitment));

      if (!record) continue;

      records.set(stateCommitment, record);
    }

    if (commitments?.length) console.log('resolveCommitments', commitments.length, records.size);

    return records;
  }

  // Nullifier is published in network when a note is spent or swap is claimed.
  // - if we possess a matching note or swap record, mark it as spent/claimed
  // - return all records matched
  private async resolveNullifiers(nullifiers: Nullifier[], height: bigint) {
    const spentNullifiers = new Map<Nullifier, SpendableNoteRecord | SwapRecord>();

    for (const nf of nullifiers) {
      const record =
        (await this.indexedDb.getSpendableNoteByNullifier(nf)) ??
        (await this.indexedDb.getSwapByNullifier(nf));

      if (!record) continue;
      console.log('matched record', record);

      spentNullifiers.set(nf, record);

      // record spend/claim
      if ('heightSpent' in record) {
        // spendable note
        record.heightSpent = height;
        await this.indexedDb.saveSpendableNote(record);
      } else if ('heightClaimed' in record) {
        // swap claimed
        record.heightClaimed = height;
        await this.indexedDb.saveSwap(record);
      }
    }

    if (nullifiers.length)
      console.log('resolveNullifiers', nullifiers.length, spentNullifiers.size);

    return spentNullifiers;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async identifyRelevantTransactions(
    blockSpent: Nullifier[],
    blockCommitted: StateCommitment[],
    blockTxs: Transaction[],
  ) {
    console.log('identifyRelevantTransactions', blockTxs.length, {
      nullifiers: blockSpent.length,
      commitments: blockCommitted.length,
    });

    const relevantTx = new Array<Transaction>();

    for (const tx of blockTxs) {
      const acts = tx.body?.actions;
      if (!acts) continue;

      // match on nullifiers
      const txNullifiers = acts.map(({ action }) => {
        switch (action.case) {
          case 'spend':
          case 'swapClaim':
            return action.value.body?.nullifier;
          default:
            return;
        }
      });

      console.log('tx actionsNullifiers', acts.length, txNullifiers.length, txNullifiers);

      // match on commitments
      const txCommitments = acts.flatMap(({ action }) => {
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

      console.log('tx actionsCommitments', acts.length, txCommitments.length, txCommitments);

      const txMatchNullifier = txNullifiers.some(an => blockSpent.find(n => n.equals(an)));
      const txMatchCommitment = txCommitments.some(ac => blockCommitted.find(c => c.equals(ac)));
      if (txMatchNullifier || txMatchCommitment) {
        console.log('relevant tx', txMatchNullifier, txMatchCommitment, tx);
        relevantTx.push(tx);
      }
    }
    return relevantTx;
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
        if (action.case === 'positionOpen' && action.value.position)
          for (const state of positionStates) {
            const positionState = new PositionState({ state });
            const metadata = this.viewServer.getLpNftMetadata(action.value.position, positionState);
            await this.indexedDb.saveAssetsMetadata(metadata);
          }
      }
    }
  }

  //private async saveTransactionInfo(height: bigint, relevantTx: Map<string, Transaction>) {
  private async saveTransactionInfo(height: bigint, allTx: Transaction[]) {
    for (const transaction of allTx) {
      console.log('generating info', transaction);
      const { txp: perspective, txv: view } = await transactionInfo(
        this.fullViewingKey,
        transaction,
        this.indexedDb.constants(),
      );
      const txId = await sha256Hash(transaction.toBinary());
      await this.indexedDb.saveTransactionInfo(
        new TransactionInfo({
          height,
          id: { inner: txId },
          transaction,
          perspective,
          view,
        }),
      );
    }
  }

  // TODO: should this be here? it's only ever used as a fallback by view protocol server
  // identify failures?
  async getTransactionInfo(id: TransactionId): Promise<TransactionInfo> {
    const { transaction, height } = await this.querier.tendermint.getTransaction(id);
    const { txp: perspective, txv: view } = await transactionInfo(
      this.fullViewingKey,
      transaction,
      this.indexedDb.constants(),
    );
    return new TransactionInfo({ height, id, transaction, perspective, view });
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

const isAbortSignal = (error: unknown): boolean =>
  error instanceof ConnectError && error.code === Code.Canceled;
