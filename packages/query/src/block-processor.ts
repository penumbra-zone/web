import {
  base64ToUint8Array,
  IndexedDbInterface,
  isDevEnv,
  NewNoteRecord,
  uint8ArrayToBase64,
  ViewServerInterface,
} from 'penumbra-types';
import { RootQuerier } from './root-querier';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { bech32 } from 'bech32';
import { Code, ConnectError } from '@connectrpc/connect';
import { backOff } from 'exponential-backoff';
import { decodeNctRoot } from 'penumbra-wasm-ts/src/sct';

interface QueryClientProps {
  querier: RootQuerier;
  indexedDb: IndexedDbInterface;
  viewServer: ViewServerInterface;
}

export class BlockProcessor {
  private readonly querier: RootQuerier;
  private readonly indexedDb: IndexedDbInterface;
  private readonly viewServer: ViewServerInterface;
  private readonly abortController: AbortController = new AbortController();
  private blockSyncPromise: Promise<void> | undefined;

  constructor({ indexedDb, viewServer, querier }: QueryClientProps) {
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
        numOfAttempts: Infinity,
        retry: async error => {
          await this.viewServer.resetTreeToStored();
          return !isAbortSignal(error);
        },
      });
    } catch {
      // Was signaled to abort, can swallow this error
    }
  }

  async storeNewNotes(notes: NewNoteRecord[]) {
    for (const n of notes) {
      await this.indexedDb.saveSpendableNote(n);

      // We need to query separately to convert assetId's into readable denom strings. Persisting those to storage.
      const assetId = base64ToUint8Array(n.note.value.assetId.inner);
      const storedDenomData = await this.indexedDb.getAssetsMetadata(assetId);
      if (!storedDenomData) {
        const metadata = await this.querier.shieldedPool.denomMetadata(n.note.value.assetId.inner);
        if (metadata) {
          await this.indexedDb.saveAssetsMetadata(metadata);
        } else {
          const denomMetadata = generateMetadata(assetId);
          await this.indexedDb.saveAssetsMetadata(denomMetadata);
        }
      }
    }
  }

  // Each nullifier has a corresponding note stored. This marks them as spent at a specific block height.
  async markNotesSpent(nullifiers: Nullifier[], blockHeight: bigint) {
    for (const nullifier of nullifiers) {
      const stringId = uint8ArrayToBase64(nullifier.inner);
      const matchingNote = await this.indexedDb.getNoteByNullifier(stringId);
      if (matchingNote) {
        matchingNote.heightSpent = blockHeight;
        await this.indexedDb.saveSpendableNote(matchingNote);
      }
    }
  }

  async saveSyncProgress(height: bigint) {
    const updates = await this.viewServer.updatesSinceCheckpoint();
    await this.indexedDb.updateStateCommitmentTree(updates, height);
  }

  // Compares the locally stored, filtered SCT root with the actual one on chain. They should match.
  // This is expensive to do every block, so should only be done in development.
  private async assertRootValid(blockHeight: bigint): Promise<void> {
    const sourceOfTruth = await this.querier.app.keyValue(`sct/anchor/${blockHeight}`);
    const inMemoryRoot = this.viewServer.getNctRoot();

    if (decodeNctRoot(sourceOfTruth) !== inMemoryRoot) {
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
      await this.storeNewNotes(scanResult.new_notes);
      await this.markNotesSpent(res.compactBlock.nullifiers, res.compactBlock.height);

      if (isDevEnv()) {
        await this.assertRootValid(res.compactBlock.height);
      }

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
// - if dev environment, every 100th block
// - if not, every 1000th block
const shouldStoreProgress = (block: CompactBlock, upToDateBlock: bigint): boolean => {
  if (block.height === 0n) return false;
  const interval = isDevEnv() ? 1n : 1000n;
  return block.height >= upToDateBlock || block.height % interval === 0n;
};

export const UNNAMED_ASSET_PREFIX = 'passet';

const generateMetadata = (assetId: Uint8Array): DenomMetadata => {
  const words = bech32.toWords(assetId);
  const denom = bech32.encode(UNNAMED_ASSET_PREFIX, words);
  return new DenomMetadata({
    base: denom,
    denomUnits: [{ aliases: [], denom, exponent: 0 }],
    display: denom,
    penumbraAssetId: { inner: assetId },
  });
};
