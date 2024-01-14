import { RootQuerier } from './root-querier';

import { Code, ConnectError } from '@connectrpc/connect';
import { bech32 } from 'bech32';
import { backOff } from 'exponential-backoff';

import { sha256Hash } from '@penumbra-zone/crypto-web';
import {
  BlockProcessorInterface,
  IndexedDbInterface,
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
      const flushReasons =
        wasmWantsFlush ||
        compactBlock.height % 1000n === 0n ||
        compactBlock.height > latestBlockHeight;

      let compactScan;
      if (flushReasons) {
        compactScan = this.viewServer.flushUpdates();

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

      // - nullifiers on this block may match stored notes or swaps
      // - queries idb for note/swap records
      // - updates resolved height of record
      // - returns any touched records with unknown source
      // identified records may be old, or they may have just landed. wasm
      // should flush every time we encounter new records, so they are ready in
      // idb for this resolution.
      const sourcelessRecords = await this.resolveNullifiers(
        compactBlock.nullifiers,
        compactBlock.height,
      );

      console.log(
        'sourcelessRecords',
        Array.from(sourcelessRecords.values()).map(x => x.toJsonString()),
      );

      // probably scanning too often?
      // are some of these equivalent?
      const fullScanReasons =
        Boolean(compactBlock.nullifiers.length) ||
        Boolean(compactScan?.newNotes.length) ||
        Boolean(compactScan?.newSwaps.length) ||
        Boolean(sourcelessRecords.size);

      if (fullScanReasons) {
        // this is a network query
        const fullBlock = await this.querier.app.txsByHeight(compactBlock.height);

        const relevantTx = await this.resolveSources(sourcelessRecords, fullBlock.transactions);

        // during wasm tx info generation later, wasm independently queries
        // database for asset metadata, so we have to pre-populate. LpNft
        // position states aren't known by the chain so aren't poulated by
        // identifyNewAssets
        // - detect LpNft position opens, and generate all possible position state metadata
        // - update idb
        await this.identifyLpNftPositions(Array.from(relevantTx.values()));

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

  // Nullifier is published in network when a note is spent or swap is claimed.
  // - if we possess a matching note or swap record, mark it as spent/claimed
  // - if we resolve a record sourced from a transaction, and its id is not
  // recorded, collect and return.
  private async resolveNullifiers(nullifiers: Nullifier[], height: bigint) {
    const recordNeedsSourceTxId = new Map<string, SpendableNoteRecord | SwapRecord>();

    // - match nullifiers to idb notes/swaps
    // - collect any record missing its source
    // - write to idb.
    for (const nullifier of nullifiers) {
      const record =
        (await this.indexedDb.getNoteByNullifier(nullifier)) ??
        (await this.indexedDb.getSwapByNullifier(nullifier));

      if (!record) continue;

      // resolve nullifiers for any records of any source type
      if ('heightSpent' in record) {
        // spendable note
        record.heightSpent = height;
        await this.indexedDb.saveSpendableNote(record);
      } else if ('heightClaimed' in record) {
        // swap claimed
        record.heightClaimed = height;
        await this.indexedDb.saveSwap(record);
      }

      // we want to recover ids for transaction sources that don't have an id,
      // represented by an empty Uint8Array
      if (
        record.source?.equals({ source: { case: 'transaction', value: { id: new Uint8Array() } } })
      )
        recordNeedsSourceTxId.set(uint8ArrayToHex(nullifier.inner), record);
    }

    return recordNeedsSourceTxId;
  }

  // TODO: can we use compactBlock.nullifiers?
  async resolveSources(
    sourcelessRecords: Map<string, SwapRecord | SpendableNoteRecord>,
    blockTransactions: Transaction[],
  ) {
    // map all of this block's tx action nullifiers to ids of the containing tx.
    // nullifier inner as matchable string -> transaction
    const blockTxByNullifier = new Map<string, Transaction>();

    for (const tx of blockTransactions) {
      const actionsNullifiers = tx.body?.actions.map(({ action }) => {
        switch (action.case) {
          case 'spend':
          case 'swapClaim':
            return action.value.body?.nullifier;
          default:
            return;
        }
      });
      actionsNullifiers?.map(
        nullifier =>
          nullifier?.inner.length && blockTxByNullifier.set(uint8ArrayToHex(nullifier.inner), tx),
      );
    }

    // match record nullifiers to those tx nullifiers
    // if we have a tx, we can hash it for id, and assign source
    // collect txs we use this way, to generate transactioninfos later
    const relevantTx = new Map<string, Transaction>();
    for (const [nullifierString, record] of sourcelessRecords.entries()) {
      const sourceTx = blockTxByNullifier.get(nullifierString);
      if (!sourceTx) {
        console.error("no tx on block for nullifier on block, can't generate transactioninfo");
        continue;
      }

      const id = await sha256Hash(sourceTx.toBinary());
      // TODO: is there a race condition here? should we query the record again?
      record.source = new CommitmentSource({
        source: { case: 'transaction', value: { id } },
      });
      const idString = uint8ArrayToHex(id);
      relevantTx.set(idString, sourceTx);

      if (record instanceof SpendableNoteRecord) await this.indexedDb.saveSpendableNote(record);
      else if (record instanceof SwapRecord) await this.indexedDb.saveSwap(record);
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

  private async saveTransactionInfo(height: bigint, relevantTx: Map<string, Transaction>) {
    for (const [idString, transaction] of relevantTx) {
      const { txp: perspective, txv: view } = await transactionInfo(
        this.fullViewingKey,
        transaction,
        this.indexedDb.constants(),
      );
      await this.indexedDb.saveTransactionInfo(
        new TransactionInfo({
          height,
          id: { inner: hexToUint8Array(idString) },
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
