import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { backOff } from 'exponential-backoff';
import { BlockProcessorInterface, IndexedDbInterface, ViewServerInterface } from 'penumbra-types';
import { decodeNctRoot } from 'penumbra-wasm-ts/src/sct';
import { RootQuerier } from '../root-querier';
import { generateMetadata } from './metadata';
import { Transactions } from './transactions';

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

  async storeNewTransactions(blockHeight: bigint, newNotes: SpendableNoteRecord[]) {
    const transactions = new Transactions(
      blockHeight,
      this.fullViewingKey,
      this.indexedDb,
      this.querier.tendermint,
    );

    for (const n of newNotes) {
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

  async saveSyncProgress() {
    const result = this.viewServer.flushUpdates();
    await this.indexedDb.saveScanResult(result);
    await this.storeNewTransactions(result.height, result.newNotes);

    // In dev mode, you may want to validate local sct against remote
    // await this.assertRootValid(result.height);
  }

  stopSync() {
    this.abortController.abort();
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
    const latestBlockHeight = await this.querier.tendermint.latestBlockHeight();

    // Continuously runs as new blocks are committed
    for await (const block of this.querier.compactBlock.compactBlockRange({
      startHeight,
      keepAlive: true,
      abortSignal: this.abortController.signal,
    })) {
      if (block.fmdParameters) await this.indexedDb.saveFmdParams(block.fmdParameters);

      // Scanning has a side effect of updating viewServer's internal tree.
      const newNotesPresent = await this.viewServer.scanBlock(block);

      if (shouldStoreProgress(newNotesPresent, block, latestBlockHeight)) {
        await this.saveSyncProgress();
      }

      await this.markNotesSpent(block.nullifiers, block.height);
    }
  }
}

const isAbortSignal = (error: unknown): boolean =>
  error instanceof ConnectError && error.code === Code.Canceled;

// Writing to disc is expensive, so storing progress occurs:
// - if new notes are present in that block
// - if syncing is up-to-date, on every block
// - if not, every 1000th block
const shouldStoreProgress = (
  newNotesPresent: boolean,
  block: CompactBlock,
  latestBlockHeight: bigint,
): boolean => {
  if (newNotesPresent) return true;
  return block.height >= latestBlockHeight || block.height % 1000n === 0n;
};
