import { ObliviousQuerier } from './oblivious';
import { SpecificQuerier } from './specific';
import { IndexedDbInterface, SpendableNoteRecord, ViewServerInterface } from 'penumbra-types';

interface QueryClientProps {
  oblQuerier: ObliviousQuerier;
  specQuerier: SpecificQuerier;
  indexedDb: IndexedDbInterface;
  viewServer: ViewServerInterface;
}

export class BlockProcessor {
  private readonly oblQuerier: ObliviousQuerier;
  private readonly specQuerier: SpecificQuerier;
  private readonly indexedDb: IndexedDbInterface;
  private readonly viewServer: ViewServerInterface;

  constructor({ indexedDb, viewServer, oblQuerier, specQuerier }: QueryClientProps) {
    this.indexedDb = indexedDb;
    this.viewServer = viewServer;
    this.oblQuerier = oblQuerier;
    this.specQuerier = specQuerier;
  }

  async syncBlocks() {
    const lastBlock = await this.indexedDb.getLastBlockSynced();
    const startHeight = lastBlock ? lastBlock + 1n : 0n;

    for await (const res of this.oblQuerier.compactBlockRange(startHeight, true)) {
      const scanResult = await this.viewServer.scanBlock(res.compactBlock!);
      await this.handleNewNotes(scanResult.new_notes);
      await this.indexedDb.saveLastBlockSynced(res.compactBlock!.height);
    }
  }

  async handleNewNotes(notes: SpendableNoteRecord[]) {
    for (const n of notes) {
      await this.indexedDb.saveSpendableNote(n);
      const metadata = await this.specQuerier.denomMetadata(n.note.value.assetId);
      if (metadata) {
        await this.indexedDb.saveAssetsMetadata(metadata);
      }
    }
  }
}
