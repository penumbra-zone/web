import {
  base64ToUint8Array,
  IndexedDbInterface,
  NewNoteRecord,
  uint8ArrayToBase64,
  ViewServerInterface,
} from 'penumbra-types';
import { decodeNctRoot, generateMetadata } from 'penumbra-wasm-ts/src/sct';
import { RootQuerier } from './root-querier';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';

interface QueryClientProps {
  querier: RootQuerier;
  indexedDb: IndexedDbInterface;
  viewServer: ViewServerInterface;
}

export class BlockProcessor {
  private readonly querier: RootQuerier;
  private readonly indexedDb: IndexedDbInterface;
  private readonly viewServer: ViewServerInterface;

  constructor({ indexedDb, viewServer, querier }: QueryClientProps) {
    this.indexedDb = indexedDb;
    this.viewServer = viewServer;
    this.querier = querier;
  }

  async syncBlocks() {
    try {
      await this.syncAndStore();
    } catch (e) {
      await this.viewServer.resetTreeToStored();
      console.error(e);
      throw e;
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
    const { lastBlockHeight } = await this.querier.narsil.info();

    // Continuously runs as new blocks are committed
    for await (const res of this.querier.compactBlock.compactBlockRange(startHeight, true)) {
      if (!res.compactBlock) throw new Error('No compant block in response');

      // Scanning has a side effect of updating viewServer's internal tree.
      const scanResult = this.viewServer.scanBlock(res.compactBlock);

      // TODO: We should not store new blocks as we find them, but only when sync progress is saved: https://github.com/penumbra-zone/web/issues/34
      //       However, the current wasm crate discards the new notes on every block scan.
      await this.storeNewNotes(scanResult.new_notes);
      await this.markNotesSpent(res.compactBlock.nullifiers, res.compactBlock.height);

      await this.assertRootValid(res.compactBlock.height); // TODO: Put behind debug flag

      if (shouldStoreProgress(res.compactBlock, lastBlockHeight)) {
        await this.saveSyncProgress(res.compactBlock.height);
      }
    }
  }
}

// Writing to disc is expensive, so storing progress occurs:
// - if syncing is up-to-date, on every block
// - if not, every 1000th block
const shouldStoreProgress = (block: CompactBlock, upToDateBlock: bigint): boolean => {
  return block.height >= upToDateBlock || block.height % 1000n === 0n;
};
