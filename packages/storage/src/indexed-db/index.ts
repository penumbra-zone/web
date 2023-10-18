import { IDBPDatabase, openDB } from 'idb';
import {
  IDB_TABLES,
  IdbConstants,
  IndexedDbInterface,
  PenumbraDb,
  ScanResult,
  StateCommitmentTree,
} from 'penumbra-types';
import { IbdUpdater, IbdUpdates, TableUpdateNotifier } from './updater';
import {
  FmdParameters,
  NoteSource,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import {
  SpendableNoteRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

interface IndexedDbProps {
  dbVersion: number; // Incremented during schema changes
  chainId: string;
  updateNotifiers?: TableUpdateNotifier[]; // Consumers subscribing to updates
  walletId: string;
}

export class IndexedDb implements IndexedDbInterface {
  private constructor(
    private readonly db: IDBPDatabase<PenumbraDb>,
    private readonly u: IbdUpdater,
    private readonly c: IdbConstants,
  ) {}

  static async initialize({
    dbVersion,
    updateNotifiers,
    walletId,
    chainId,
  }: IndexedDbProps): Promise<IndexedDb> {
    const dbName = `viewdata/${chainId}/${walletId}`;

    const db = await openDB<PenumbraDb>(dbName, dbVersion, {
      upgrade(db: IDBPDatabase<PenumbraDb>) {
        db.createObjectStore('LAST_BLOCK_SYNCED');
        db.createObjectStore('ASSETS', { keyPath: 'penumbraAssetId.inner' });
        db.createObjectStore('SPENDABLE_NOTES').createIndex('nullifier', 'nullifier.inner');
        db.createObjectStore('TRANSACTIONS', { keyPath: 'id.hash' });
        db.createObjectStore('TREE_LAST_POSITION');
        db.createObjectStore('TREE_LAST_FORGOTTEN');
        db.createObjectStore('TREE_COMMITMENTS', { keyPath: 'commitment.inner' });
        // No unique id for given tree hash and hash can be the same for different positions. Using `autoIncrement` to make the item key an incremented index.
        db.createObjectStore('TREE_HASHES', { autoIncrement: true });
        db.createObjectStore('FMD_PARAMETERS');

        // TODO: To implement
        db.createObjectStore('NOTES');
        db.createObjectStore('SWAPS');
      },
    });
    const updater = new IbdUpdater(db, updateNotifiers);
    const constants = {
      name: dbName,
      version: dbVersion,
      tables: IDB_TABLES,
    } satisfies IdbConstants;
    return new this(db, updater, constants);
  }

  constants(): IdbConstants {
    return this.c;
  }

  public async getStateCommitmentTree(): Promise<StateCommitmentTree> {
    const lastPosition = await this.db.get('TREE_LAST_POSITION', 'last_position');
    const lastForgotten = await this.db.get('TREE_LAST_FORGOTTEN', 'last_forgotten');
    const hashes = await this.db.getAll('TREE_HASHES');
    const commitments = await this.db.getAll('TREE_COMMITMENTS');

    return {
      last_position: lastPosition ?? { Position: { epoch: 0, block: 0, commitment: 0 } },
      last_forgotten: lastForgotten ?? 0,
      hashes,
      commitments,
    };
  }

  // All updates must be atomic in order to prevent invalid tree state
  public async saveScanResult(updates: ScanResult): Promise<void> {
    const txs = new IbdUpdates();

    this.addSctUpdates(txs, updates.sctUpdates);
    this.addNewNotes(txs, updates.newNotes);
    // TODO: this.addNewSwaps(txs, updates.newSwaps);
    txs.add({ table: 'LAST_BLOCK_SYNCED', value: updates.height, key: 'last_block' });

    await this.u.updateAll(txs);
  }

  async getLastBlockSynced() {
    return this.db.get('LAST_BLOCK_SYNCED', 'last_block');
  }

  async getNoteByNullifier(nullifier: Nullifier): Promise<SpendableNoteRecord | undefined> {
    return this.db.getFromIndex('SPENDABLE_NOTES', 'nullifier', nullifier.inner);
  }

  async saveSpendableNote(note: SpendableNoteRecord) {
    if (!note.noteCommitment?.inner) throw new Error('noteCommitment not present');
    await this.u.update({ table: 'SPENDABLE_NOTES', value: note, key: note.noteCommitment.inner });
  }

  async getAssetsMetadata(assetId: AssetId): Promise<DenomMetadata | undefined> {
    return this.db.get('ASSETS', assetId.inner);
  }

  async getAllAssetsMetadata() {
    return this.db.getAll('ASSETS');
  }

  async saveAssetsMetadata(metadata: DenomMetadata) {
    await this.u.update({ table: 'ASSETS', value: metadata });
  }

  async getAllNotes() {
    return this.db.getAll('SPENDABLE_NOTES');
  }

  async getAllTransactions() {
    return this.db.getAll('TRANSACTIONS');
  }

  async saveTransactionInfo(tx: TransactionInfo): Promise<void> {
    await this.u.update({ table: 'TRANSACTIONS', value: tx });
  }

  async getTransaction(source: NoteSource): Promise<TransactionInfo | undefined> {
    return this.db.get('TRANSACTIONS', source.inner);
  }

  async getFmdParams(): Promise<FmdParameters | undefined> {
    return this.db.get('FMD_PARAMETERS', 'params');
  }

  async saveFmdParams(value: FmdParameters): Promise<void> {
    await this.u.update({ table: 'FMD_PARAMETERS', value, key: 'params' });
  }

  async clear() {
    for (const storeName of Object.values(this.db.objectStoreNames)) {
      await this.db.clear(storeName);
    }
  }

  private addSctUpdates(txs: IbdUpdates, sctUpdates: ScanResult['sctUpdates']): void {
    if (sctUpdates.set_position) {
      txs.add({
        table: 'TREE_LAST_POSITION',
        value: sctUpdates.set_position,
        key: 'last_position',
      });
    }

    if (sctUpdates.set_forgotten) {
      txs.add({
        table: 'TREE_LAST_FORGOTTEN',
        value: sctUpdates.set_forgotten,
        key: 'last_forgotten',
      });
    }

    for (const c of sctUpdates.store_commitments) {
      txs.add({ table: 'TREE_COMMITMENTS', value: c });
    }

    for (const h of sctUpdates.store_hashes) {
      txs.add({ table: 'TREE_HASHES', value: h });
    }

    // TODO: What about updates.delete_ranges?
  }

  private addNewNotes(txs: IbdUpdates, notes: SpendableNoteRecord[]): void {
    for (const n of notes) {
      if (!n.noteCommitment?.inner) throw new Error('noteCommitment not present');

      txs.add({
        table: 'SPENDABLE_NOTES',
        value: n,
        key: n.noteCommitment.inner,
      });
    }
  }
}
