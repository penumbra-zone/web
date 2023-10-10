import { IndexedDbInterface, ViewServerInterface } from 'penumbra-types';
import { RootQuerier } from '../root-querier';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { backOff } from 'exponential-backoff';
import { decodeNctRoot } from 'penumbra-wasm-ts/src/sct';
import { Transactions } from './transactions';
import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { generateMetadata } from './metadata';

interface QueryClientProps {
  fullViewingKey: string;
  querier: RootQuerier;
  indexedDb: IndexedDbInterface;
  viewServer: ViewServerInterface;
}

export class BlockProcessor {
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

  async storeNewNotes(blockHeight: bigint, notes: SpendableNoteRecord[]) {
    const transactions = new Transactions(
      blockHeight,
      this.fullViewingKey,
      this.indexedDb,
      this.querier.tendermint,
    );

    for (const n of notes) {
      await this.indexedDb.saveSpendableNote(n);
      await this.storeAssetDenoms(n.note?.value?.assetId);
      await transactions.add(n.source);
    }

    await transactions.storeTransactionInfo();
  }

  // Each nullifier has a corresponding note stored. This marks them as spent at a specific block height.
  async markNotesSpent(nullifiers: Nullifier[], blockHeight: bigint) {
    for (const nullifier of nullifiers) {
      const matchingNote = await this.indexedDb.getNoteByNullifier(nullifier);
      if (matchingNote) {
        matchingNote.heightSpent = blockHeight;
        await this.indexedDb.saveSpendableNote(matchingNote);
      }
    }
  }

  async saveSyncProgress(height: bigint) {
    const updates = await this.viewServer.updatesSinceCheckpoint();
    await this.indexedDb.updateStateCommitmentTree(updates, height);

    // In dev mode, you may want to validate local sct against remote
    // await this.assertRootValid(res.compactBlock.height);
  }

  // We need to query separately to convert assetId's into readable denom strings. Persisting those to storage.
  private async storeAssetDenoms(assetId?: AssetId) {
    if (!assetId) return;

    const storedDenomData = await this.indexedDb.getAssetsMetadata(assetId);
    if (!storedDenomData) {
      const metadata = await this.querier.shieldedPool.denomMetadata(assetId);
      if (metadata) {
        await this.indexedDb.saveAssetsMetadata(metadata);
      } else {
        const denomMetadata = generateMetadata(assetId);
        await this.indexedDb.saveAssetsMetadata(denomMetadata);
      }
    }
  }

  // Compares the locally stored, filtered SCT root with the actual one on chain. They should match.
  // This is expensive to do every block, so should only be done in development.
  // @ts-expect-error Only used ad-hoc in dev
  private async assertRootValid(blockHeight: bigint): Promise<void> {
    const sourceOfTruth = await this.querier.app.keyValue(`sct/anchor/${blockHeight}`);
    const inMemoryRoot = this.viewServer.getNctRoot();

    if (!decodeNctRoot(sourceOfTruth).equals(inMemoryRoot)) {
      throw new Error(
        `Block height: ${blockHeight}. Wasm root does not match remote source of truth. Programmer error.`,
      );
    }
  }

  private async syncAndStore() {
    const lastBlockSynced = await this.indexedDb.getLastBlockSynced();
    const startHeight = lastBlockSynced ? lastBlockSynced + 1n : 0n;
    const lastBlockHeight = await this.querier.tendermint.lastBlockHeight();

    // Continuously runs as new blocks are committed
    for await (const res of this.querier.compactBlock.compactBlockRange({
      startHeight,
      keepAlive: true,
      abortSignal: this.abortController.signal,
    })) {
      if (!res.compactBlock) throw new Error('No block in response');

      // Scanning has a side effect of updating viewServer's internal tree.
      const scanResult = await this.viewServer.scanBlock(res.compactBlock);

      // TODO: We should not store new blocks as we find them, but only when sync progress is saved: https://github.com/penumbra-zone/web/issues/34
      //       However, the current wasm crate discards the new notes on every block scan.
      await this.storeNewNotes(res.compactBlock.height, scanResult.newNotes);
      await this.markNotesSpent(res.compactBlock.nullifiers, res.compactBlock.height);

      if (shouldStoreProgress(res.compactBlock, lastBlockHeight)) {
        await this.saveSyncProgress(res.compactBlock.height);
      }
    }
  }
}

const isAbortSignal = (error: unknown): boolean =>
  error instanceof ConnectError && error.code === Code.Canceled;

// Writing to disc is expensive, so storing progress occurs:
// - if syncing is up-to-date, on every block
// - if not, every 1000th block
const shouldStoreProgress = (block: CompactBlock, upToDateBlock: bigint): boolean => {
  if (block.height === 0n) return false;
  return block.height >= upToDateBlock || block.height % 1000n === 0n;
};
