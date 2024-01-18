import { RootQuerier } from './root-querier';

import { Code, ConnectError } from '@connectrpc/connect';
import { bech32 } from 'bech32';
import { backOff } from 'exponential-backoff';

import { sha256Hash } from '@penumbra-zone/crypto-web';
import {
  BlockProcessorInterface,
  IndexedDbInterface,
  ScanBlockResult,
  ViewServerInterface,
  hexToUint8Array,
  uint8ArrayToHex,
} from '@penumbra-zone/types';
import { decodeSctRoot, transactionInfo } from '@penumbra-zone/wasm-ts';

import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
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

type NeedsSourceId = boolean;
type CommitmentHexString = string;

// empty uint8array represents an unset source tx id
const blankTxSource = new CommitmentSource({
  source: { case: 'transaction', value: { id: new Uint8Array() } },
});

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

  stopSync() {
    this.abortController.abort();
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

  // After a failure, retrying the sync is critical. An exponential-backoff is used.
  private async autoRetrySync() {
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

  /**
   * Populates IndexedDB with data from the blockchain. Most of what's in
   * IndexedDB comes from this method.
   */
  private async syncAndStore() {
    const lastBlockSynced = await this.indexedDb.getLastBlockSynced();
    const startHeight = lastBlockSynced ? lastBlockSynced + 1n : 0n;
    const latestBlockHeight = await this.querier.tendermint.latestBlockHeight();

    // this is an indefinite stream of the (compact) chain from the network
    // intended to run continuously
    performance.mark('start');
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

      if (flushReasons.new) console.log('finished sync', performance.measure('start'));

      // state commitments identifying new records in this compact block, with a
      // boolean to indicate if we should recover their source id
      const blockCommitments = new Map<CommitmentHexString, NeedsSourceId>();
      let flush: ScanBlockResult | undefined;
      if (Object.values(flushReasons).some(Boolean)) {
        flush = this.viewServer.flushUpdates();
        console.log('flush', flushReasons, flush, compactBlock);

        // in an atomic query, this
        // - saves 'sctUpdates'
        // - saves new decrypted notes
        // - saves new decrypted swaps
        // - updates last block synced
        await this.indexedDb.saveScanResult(flush);

        // - detect unknown asset types, query the chain for asset metadata
        // - or, generate default fallback metadata
        // - update idb
        // this makes a network query.
        // TODO: should this be scanning swaps as well?
        await this.identifyNewAssets(flush.newNotes);

        // boolean indicates if we should recover source id
        for (const { noteCommitment, source } of flush.newNotes)
          blockCommitments.set(
            uint8ArrayToHex(noteCommitment!.inner),
            source!.equals(blankTxSource),
          );
        for (const { swapCommitment, source } of flush.newSwaps)
          blockCommitments.set(
            uint8ArrayToHex(swapCommitment!.inner),
            source!.equals(blankTxSource),
          );
      }

      // nullifiers on this block may match notes or swaps from db
      // - update idb, mark as spent/claimed
      // - return records' commitments
      // - with a boolean to indicate if we should recover source id
      const nullifierCommitments = await this.resolveNullifiers(
        compactBlock.nullifiers,
        compactBlock.height,
      );

      // if anything happend involving a commitment, scan all block tx
      if (nullifierCommitments.size || blockCommitments.size) {
        const allCommitments = new Map([...nullifierCommitments, ...blockCommitments]);
        console.warn(
          'full block fetch',
          'flushed commitments',
          flush?.sctUpdates.store_commitments.length,
          'nullifierCommitments',
          nullifierCommitments.size,
          'blockCommitments',
          blockCommitments.size,
          'allCommitments',
          allCommitments.size,
        );
        // this is a network query
        const { blockHeight, transactions: blockTx } = await this.querier.app.txsByHeight(
          compactBlock.height,
        );

        const { relevantTx, sourceTx } = await this.identifyTransactions(allCommitments, blockTx);

        console.warn('relevantTx', relevantTx.size, 'sourceTx', sourceTx.size);

        await this.saveSourceIds(sourceTx);

        // during wasm tx info generation later, wasm independently queries
        // database for asset metadata, so we have to pre-populate. LpNft
        // position states aren't known by the chain so aren't poulated by
        // identifyNewAssets
        // - detect LpNft position opens, and generate all possible position state metadata
        // - update idb
        await this.identifyLpNftPositions(blockTx);

        // at this point txinfo can be generated and saved. this will resolve
        // pending broadcasts, and populate the transaction list.
        // - calls wasm for each relevant tx
        // - saves to idb
        await this.saveTransactionInfos(blockHeight, relevantTx);
      }
    }
  }

  private async saveSourceIds(recovered: Map<StateCommitment, Uint8Array>) {
    for (const [commitment, sourceId] of recovered) {
      const record =
        (await this.indexedDb.getSpendableNoteByCommitment(commitment)) ??
        (await this.indexedDb.getSwapByCommitment(commitment));
      if (!record) continue;
      if (blankTxSource.equals(record.source))
        record.source = new CommitmentSource({
          source: { case: 'transaction', value: { id: sourceId } },
        });
      else console.warn('already have source id!!', record.source);
      if (record instanceof SpendableNoteRecord) await this.indexedDb.saveSpendableNote(record);
      else if (record instanceof SwapRecord) await this.indexedDb.saveSwap(record);
      else throw new Error('Unknown record type');
    }
  }

  /**
   * Save any as-yet-unknown asset metadata found in a block's notes to our
   * database.
   */
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

  // Nullifier is published in network when a note is spent or swap is claimed.
  // - if we possess a matching note or swap record, mark it as spent/claimed
  // - collect and return all commitments involved
  private async resolveNullifiers(nullifiers: Nullifier[], height: bigint) {
    const relevantCommitments = new Map<CommitmentHexString, NeedsSourceId>();

    for (const nf of nullifiers) {
      const record =
        (await this.indexedDb.getSpendableNoteByNullifier(nf)) ??
        (await this.indexedDb.getSwapByNullifier(nf));
      if (!record) continue;
      console.log('matched record', record);

      if (record instanceof SpendableNoteRecord) {
        record.heightSpent = height;
        relevantCommitments.set(
          uint8ArrayToHex(record.noteCommitment!.inner),
          record.source!.equals(blankTxSource),
        );
        await this.indexedDb.saveSpendableNote(record);
      } else if (record instanceof SwapRecord) {
        record.heightClaimed = height;
        relevantCommitments.set(
          uint8ArrayToHex(record.swapCommitment!.inner),
          record.source!.equals(blankTxSource),
        );
        await this.indexedDb.saveSwap(record);
      } else throw new Error('Unknown record type');
    }

    return relevantCommitments;
  }

  async identifyTransactions(relevantCommitments: Map<string, boolean>, blockTx: Transaction[]) {
    console.log('identifyRelevantTransactions', blockTx.length, relevantCommitments);
    const blockTxByCommitment = new Map<CommitmentHexString, Transaction>();

    for (const tx of blockTx) {
      const acts = tx.body?.actions;
      if (!acts) continue;

      const txCommitments = acts.flatMap(({ action }) => {
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

      for (const sc of txCommitments)
        if (sc) blockTxByCommitment.set(uint8ArrayToHex(sc.inner), tx);
    }

    // this map will be used to retrieve records and assign source tx id
    const sourceTx = new Map<StateCommitment, Uint8Array>();
    // this map will be used to deduplicate relevant tx
    const relevantTxByHash = new Map<string, [TransactionId, Transaction]>();

    for (const [commitStr, needsSourceId] of relevantCommitments) {
      const tx = blockTxByCommitment.get(commitStr);
      if (!tx) {
        console.warn('no tx for commitment', commitStr, 'needsSourceId?', needsSourceId);
        continue;
      } else {
        console.warn(
          'found tx',
          uint8ArrayToHex(await sha256Hash(tx.toBinary())),
          'for commitment',
          commitStr,
          'needsSourceId?',
          needsSourceId,
        );
      }
      const txHash = await sha256Hash(tx.toBinary());
      relevantTxByHash.set(uint8ArrayToHex(txHash), [new TransactionId({ inner: txHash }), tx]);
      if (needsSourceId)
        sourceTx.set(new StateCommitment({ inner: hexToUint8Array(commitStr) }), txHash);
    }

    const relevantTx = new Map(relevantTxByHash.values());

    return { relevantTx, sourceTx };
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
  private async saveTransactionInfos(height: bigint, relevantTx: Map<TransactionId, Transaction>) {
    for (const [id, transaction] of relevantTx) {
      console.log('generating info', transaction);
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

const isAbortSignal = (error: unknown): boolean =>
  error instanceof ConnectError && error.code === Code.Canceled;
