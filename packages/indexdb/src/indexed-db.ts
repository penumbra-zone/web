import { IDBPDatabase, openDB } from 'idb';
import {
  Base64Str,
  IndexedDbInterface,
  NctUpdates,
  NewNoteRecord,
  PenumbraDb,
  StateCommitmentTree,
} from 'penumbra-types';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

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
        db.createObjectStore('assets', { keyPath: 'penumbraAssetId.inner' });
        db.createObjectStore('tree_last_position');
        db.createObjectStore('tree_last_forgotten');
        db.createObjectStore('tree_commitments', { keyPath: 'commitment.inner' });
        db.createObjectStore('tree_hashes', {
          autoIncrement: true,
          keyPath: 'index',
        });
        db.createObjectStore('spendable_notes').createIndex('nullifier', 'nullifier.inner');
      },
    });
    return new this(db);
  }

  public async getStateCommitmentTree(): Promise<StateCommitmentTree> {
    const lastPosition = await this.db.get('tree_last_position', 'last_position');
    const lastForgotten = await this.db.get('tree_last_forgotten', 'last_forgotten');
    const hashes = await this.db.getAll('tree_hashes');
    const commitments = await this.db.getAll('tree_commitments');

    return {
      last_position: lastPosition ?? { Position: { epoch: 0, block: 0, commitment: 0 } },
      last_forgotten: lastForgotten ?? 0,
      hashes,
      commitments,
    };
  }

  // All updates must be atomic in order to prevent invalid tree state
  public async updateStateCommitmentTree(updates: NctUpdates, height: bigint) {
    const tx = this.db.transaction(
      [
        'last_block_synced',
        'tree_last_position',
        'tree_last_forgotten',
        'tree_commitments',
        'tree_hashes',
      ],
      'readwrite',
    );

    if (updates.set_position) {
      await tx.objectStore('tree_last_position').put(updates.set_position, 'last_position');
    }

    if (updates.set_forgotten)
      await tx.objectStore('tree_last_forgotten').put(updates.set_forgotten, 'last_forgotten');

    for (const c of updates.store_commitments) {
      await tx.objectStore('tree_commitments').put(c);
    }

    for (const h of updates.store_hashes) {
      await tx.objectStore('tree_hashes').put(h);
    }

    await tx.objectStore('last_block_synced').put(height, 'last_block');

    await tx.done;

    // TODO: What about updates.delete_ranges?
  }

  async getLastBlockSynced() {
    return this.db.get('last_block_synced', 'last_block');
  }

  async getNoteByNullifier(nullifier: Base64Str) {
    return this.db.getFromIndex('spendable_notes', 'nullifier', nullifier);
  }

  async saveSpendableNote(note: NewNoteRecord) {
    await this.db.put('spendable_notes', note, note.noteCommitment.inner);
  }

  async getAssetsMetadata(assetId: Uint8Array) {
    return this.db.get('assets', assetId);
  }

  async saveAssetsMetadata(metadata: DenomMetadata) {
    await this.db.put('assets', metadata);
  }

  async getAllNotes() {
    return this.db.getAll('spendable_notes');
  }
}
