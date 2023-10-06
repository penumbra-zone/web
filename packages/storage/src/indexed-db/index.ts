import { IDBPDatabase, openDB } from 'idb';
import {
  Base64Str,
  DenomMetadata,
  IndexedDbInterface,
  NctUpdates,
  NewNoteRecord,
  PenumbraDb,
  StateCommitmentTree,
} from 'penumbra-types';
import { IbdUpdater, IbdUpdates, TableUpdateNotifier } from './updater';
import { StoredTransaction } from 'penumbra-types/src/transaction/view';

interface IndexedDbProps {
  dbVersion: number; // Incremented during schema changes
  chainId: string;
  updateNotifiers?: TableUpdateNotifier[]; // Consumers subscribing to updates
}

export class IndexedDb implements IndexedDbInterface {
  private constructor(
    private readonly db: IDBPDatabase<PenumbraDb>,
    private readonly u: IbdUpdater,
  ) {}

  static async initialize({ dbVersion, updateNotifiers }: IndexedDbProps): Promise<IndexedDb> {
    // TODO: https://github.com/penumbra-zone/web/issues/30
    const dbKey = 'penumbra';

    const db = await openDB<PenumbraDb>(dbKey, dbVersion, {
      upgrade(db: IDBPDatabase<PenumbraDb>) {
        db.createObjectStore('last_block_synced');
        db.createObjectStore('assets', { keyPath: 'penumbraAssetId.inner' });
        db.createObjectStore('spendable_notes').createIndex('nullifier', 'nullifier.inner');
        db.createObjectStore('transactions', { keyPath: 'id' });
        db.createObjectStore('tree_last_position');
        db.createObjectStore('tree_last_forgotten');
        db.createObjectStore('tree_commitments', { keyPath: 'commitment.inner' });
        // No unique id for given tree hash and hash can be the same for different positions. Using `autoIncrement` to make the item key an incremented index.
        db.createObjectStore('tree_hashes', { autoIncrement: true });
      },
    });
    const updater = new IbdUpdater(db, updateNotifiers);
    return new this(db, updater);
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
    const txs = new IbdUpdates();

    if (updates.set_position) {
      txs.add({
        table: 'tree_last_position',
        value: updates.set_position,
        key: 'last_position',
      });
    }

    if (updates.set_forgotten) {
      txs.add({
        table: 'tree_last_forgotten',
        value: updates.set_forgotten,
        key: 'last_forgotten',
      });
    }

    for (const c of updates.store_commitments) {
      txs.add({ table: 'tree_commitments', value: c });
    }

    for (const h of updates.store_hashes) {
      txs.add({ table: 'tree_hashes', value: h });
    }

    txs.add({ table: 'last_block_synced', value: height, key: 'last_block' });

    await this.u.updateAll(txs);

    // TODO: What about updates.delete_ranges?
  }

  async getLastBlockSynced() {
    return this.db.get('last_block_synced', 'last_block');
  }

  async getNoteByNullifier(nullifier: Base64Str) {
    return this.db.getFromIndex('spendable_notes', 'nullifier', nullifier);
  }

  async saveSpendableNote(note: NewNoteRecord) {
    await this.u.update({ table: 'spendable_notes', value: note, key: note.noteCommitment.inner });
  }

  async getAssetsMetadata(assetId: Uint8Array) {
    return this.db.get('assets', assetId);
  }

  async saveAssetsMetadata(metadata: DenomMetadata) {
    await this.u.update({ table: 'assets', value: metadata });
  }

  async getAllNotes() {
    return this.db.getAll('spendable_notes');
  }

  async getAllTransactions() {
    return this.db.getAll('transactions');
  }

  async saveTransactionInfo(tx: StoredTransaction): Promise<void> {
    await this.u.update({ table: 'transactions', value: tx });
  }

  async getTransaction(id: StoredTransaction['id']): Promise<StoredTransaction | undefined> {
    return this.db.get('transactions', id);
  }
}
