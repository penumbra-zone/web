import { IDBPDatabase, openDB, StoreNames } from 'idb';
import { StoreKey, StoreValue } from 'idb/build/entry';
import { IndexedDbInterface, PenumbraDb, SpendableNoteRecord, StoredTree } from 'penumbra-types';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb';

interface IndexedDbProps {
  dbVersion: number; // Incremented during schema changes
  chainId: string;
}

export class IndexedDb implements IndexedDbInterface {
  private constructor(private readonly db: IDBPDatabase<PenumbraDb>) {}

  static async initialize({ dbVersion }: IndexedDbProps): Promise<IndexedDb> {
    // TODO: https://github.com/penumbra-zone/web/issues/30
    const dbKey = 'penumbra';

    const db = await openDB<PenumbraDb>(dbKey, dbVersion, {
      upgrade(db: IDBPDatabase<PenumbraDb>) {
        db.createObjectStore('last_block_synced');
        db.createObjectStore('assets', {
          autoIncrement: true,
          keyPath: 'penumbraAssetId.inner',
        });
        db.createObjectStore('nct_position');
        db.createObjectStore('nct_forgotten');
        db.createObjectStore('nct_commitments', { autoIncrement: true, keyPath: 'id' });
        db.createObjectStore('nct_hashes', { autoIncrement: true, keyPath: 'id' });
        db.createObjectStore('spendable_notes');
      },
    });
    return new this(db);
  }

  public async loadStoredTree(): Promise<StoredTree> {
    return {
      last_position: await this.get('nct_position', 'position'),
      last_forgotten: await this.get('nct_forgotten', 'forgotten'),
      commitments: await this.getAll('nct_commitments'),
      hashes: await this.getAll('nct_hashes'),
    };
  }

  async getLastBlockSynced() {
    return this.get('last_block_synced', 'last_block');
  }

  async saveLastBlockSynced(height: bigint) {
    await this.put('last_block_synced', height, 'last_block');
  }

  async saveSpendableNote(note: SpendableNoteRecord) {
    await this.put('spendable_notes', note, note.noteCommitment.inner);
  }

  async getAssetsMetadata(assetIdInner: Uint8Array) {
    return this.get('assets', assetIdInner);
  }

  async saveAssetsMetadata(metadata: DenomMetadata) {
    await this.put('assets', metadata);
  }

  private async get<T extends StoreNames<PenumbraDb>>(table: T, key: StoreKey<PenumbraDb, T>) {
    return this.db.get(table, key);
  }

  private async getAll<T extends StoreNames<PenumbraDb>>(table: T) {
    return this.db.getAll(table);
  }

  private async put<T extends StoreNames<PenumbraDb>>(
    table: T,
    value: StoreValue<PenumbraDb, T>,
    key?: StoreKey<PenumbraDb, T>,
  ) {
    return this.db.put(table, value, key);
  }
}
