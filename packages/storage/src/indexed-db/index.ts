import { IDBPDatabase, openDB, StoreNames } from 'idb';
import {
  bech32ToUint8Array,
  IDB_TABLES,
  IdbConstants,
  IdbUpdate,
  IndexedDbInterface,
  PenumbraDb,
  ScanBlockResult,
  StateCommitmentTree,
  uint8ArrayToBase64,
  uint8ArrayToHex,
} from '@penumbra-zone/types';
import { IbdUpdater, IbdUpdates } from './updater';
import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';
import {
  NotesForVotingResponse,
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import {
  AddressIndex,
  IdentityKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

interface IndexedDbProps {
  dbVersion: number; // Incremented during schema changes
  chainId: string;
  walletId: string;
}

export class IndexedDb implements IndexedDbInterface {
  private constructor(
    private readonly db: IDBPDatabase<PenumbraDb>,
    private readonly u: IbdUpdater,
    private readonly c: IdbConstants,
  ) {}

  static async initialize({ dbVersion, walletId, chainId }: IndexedDbProps): Promise<IndexedDb> {
    const dbName = `viewdata/${chainId}/${walletId}`;

    const db = await openDB<PenumbraDb>(dbName, dbVersion, {
      upgrade(db: IDBPDatabase<PenumbraDb>) {
        // delete existing ObjectStores before re-creating them
        // all existing indexed-db data will be deleted when version is increased
        for (const objectStoreName of db.objectStoreNames) {
          db.deleteObjectStore(objectStoreName);
        }

        db.createObjectStore('LAST_BLOCK_SYNCED');
        db.createObjectStore('ASSETS', { keyPath: 'penumbraAssetId.inner' });
        db.createObjectStore('SPENDABLE_NOTES', {
          keyPath: 'noteCommitment.inner',
        }).createIndex('nullifier', 'nullifier.inner');
        db.createObjectStore('TRANSACTION_INFO', { keyPath: 'id.inner' });
        db.createObjectStore('TREE_LAST_POSITION');
        db.createObjectStore('TREE_LAST_FORGOTTEN');
        db.createObjectStore('TREE_COMMITMENTS', { keyPath: 'commitment.inner' });
        // No unique id for given tree hash and hash can be the same for different positions. Using `autoIncrement` to make the item key an incremented index.
        db.createObjectStore('TREE_HASHES', { autoIncrement: true });
        db.createObjectStore('FMD_PARAMETERS');

        db.createObjectStore('NOTES');
        db.createObjectStore('SWAPS', {
          keyPath: 'swapCommitment.inner',
        }).createIndex('nullifier', 'nullifier.inner');
        db.createObjectStore('GAS_PRICES');
      },
    });
    const constants = {
      name: dbName,
      version: dbVersion,
      tables: IDB_TABLES,
    } satisfies IdbConstants;
    return new this(db, new IbdUpdater(db), constants);
  }

  constants(): IdbConstants {
    return this.c;
  }

  subscribe<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
    table: StoreName,
  ): AsyncGenerator<IdbUpdate<DBTypes, StoreName>, void> {
    return this.u.subscribe(table);
  }

  public async getStateCommitmentTree(): Promise<StateCommitmentTree> {
    const lastPosition = await this.db.get('TREE_LAST_POSITION', 'last_position');
    const lastForgotten = await this.db.get('TREE_LAST_FORGOTTEN', 'last_forgotten');
    const hashes = await this.db.getAll('TREE_HASHES');
    const commitments = await this.db.getAll('TREE_COMMITMENTS');

    return {
      last_position: lastPosition ?? { Position: { epoch: 0, block: 0, commitment: 0 } },
      last_forgotten: lastForgotten ?? 0n,
      hashes,
      commitments,
    };
  }

  // All updates must be atomic in order to prevent invalid tree state
  public async saveScanResult(updates: ScanBlockResult): Promise<void> {
    const txs = new IbdUpdates();

    this.addSctUpdates(txs, updates.sctUpdates);
    this.addNewNotes(txs, updates.newNotes);
    this.addNewSwaps(txs, updates.newSwaps);
    txs.add({ table: 'LAST_BLOCK_SYNCED', value: updates.height, key: 'last_block' });

    await this.u.updateAll(txs);
  }

  async getLastBlockSynced() {
    return this.db.get('LAST_BLOCK_SYNCED', 'last_block');
  }

  async getSpendableNoteByNullifier(
    nullifier: Nullifier,
  ): Promise<SpendableNoteRecord | undefined> {
    const key = uint8ArrayToBase64(nullifier.inner);
    const json = await this.db.getFromIndex('SPENDABLE_NOTES', 'nullifier', key);
    if (!json) return undefined;
    return SpendableNoteRecord.fromJson(json);
  }

  async getSpendableNoteByCommitment(
    commitment: StateCommitment,
  ): Promise<SpendableNoteRecord | undefined> {
    const key = uint8ArrayToBase64(commitment.inner);
    const json = await this.db.get('SPENDABLE_NOTES', key);
    if (!json) return undefined;
    return SpendableNoteRecord.fromJson(json);
  }

  async saveSpendableNote(note: SpendableNoteRecord) {
    await this.u.update({ table: 'SPENDABLE_NOTES', value: note.toJson() });
  }

  async getAssetsMetadata(assetId: AssetId): Promise<DenomMetadata | undefined> {
    const key = uint8ArrayToBase64(assetId.inner);
    const json = await this.db.get('ASSETS', key);
    if (!json) return undefined;
    return DenomMetadata.fromJson(json);
  }

  async getAllAssetsMetadata() {
    const jsonVals = await this.db.getAll('ASSETS');
    return jsonVals.map(a => DenomMetadata.fromJson(a));
  }

  async saveAssetsMetadata(metadata: DenomMetadata) {
    await this.u.update({ table: 'ASSETS', value: metadata.toJson() });
  }

  async getAllSpendableNotes() {
    const jsonVals = await this.db.getAll('SPENDABLE_NOTES');
    return jsonVals.map(a => SpendableNoteRecord.fromJson(a));
  }

  async getAllTransactionInfo() {
    const jsonVals = await this.db.getAll('TRANSACTION_INFO');
    return jsonVals.map(a => TransactionInfo.fromJson(a));
  }

  async saveTransactionInfo(tx: TransactionInfo): Promise<void> {
    const value = tx.toJson();
    await this.u.update({ table: 'TRANSACTION_INFO', value });
  }

  async getTransactionInfo(txId: TransactionId): Promise<TransactionInfo | undefined> {
    const key = uint8ArrayToBase64(txId.inner);
    const json = await this.db.get('TRANSACTION_INFO', key);
    if (!json) return undefined;
    return TransactionInfo.fromJson(json);
  }

  async getFmdParams(): Promise<FmdParameters | undefined> {
    const json = await this.db.get('FMD_PARAMETERS', 'params');
    if (!json) return undefined;
    return FmdParameters.fromJson(json);
  }

  async saveFmdParams(fmd: FmdParameters): Promise<void> {
    const value = fmd.toJson();
    await this.u.update({ table: 'FMD_PARAMETERS', value, key: 'params' });
  }

  async getAllSwaps(): Promise<SwapRecord[]> {
    const jsonVals = await this.db.getAll('SWAPS');
    return jsonVals.map(a => SwapRecord.fromJson(a));
  }

  async clear() {
    for (const storeName of Object.values(this.db.objectStoreNames)) {
      await this.db.clear(storeName);
    }
  }

  private addSctUpdates(txs: IbdUpdates, sctUpdates: ScanBlockResult['sctUpdates']): void {
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
      txs.add({ table: 'SPENDABLE_NOTES', value: n.toJson() });
    }
  }

  private addNewSwaps(txs: IbdUpdates, swaps: SwapRecord[]): void {
    for (const n of swaps) {
      txs.add({ table: 'SWAPS', value: n.toJson() });
    }
  }

  async getSwapByNullifier(nullifier: Nullifier): Promise<SwapRecord | undefined> {
    const key = uint8ArrayToBase64(nullifier.inner);
    const json = await this.db.getFromIndex('SWAPS', 'nullifier', key);
    if (!json) return undefined;
    return SwapRecord.fromJson(json);
  }

  async saveSwap(swap: SwapRecord) {
    await this.u.update({ table: 'SWAPS', value: swap.toJson() });
  }

  async getSwapByCommitment(commitment: StateCommitment): Promise<SwapRecord | undefined> {
    const key = uint8ArrayToBase64(commitment.inner);
    const json = await this.db.get('SWAPS', key);
    if (!json) return undefined;
    return SwapRecord.fromJson(json);
  }

  async getGasPrices(): Promise<GasPrices | undefined> {
    return this.db.get('GAS_PRICES', 'gas_prices');
  }

  async saveGasPrices(value: GasPrices): Promise<void> {
    await this.u.update({ table: 'GAS_PRICES', value, key: 'gas_prices' });
  }

  async getNotesForVoting(
    addressIndex: AddressIndex | undefined,
    votable_at_height: bigint,
  ): Promise<NotesForVotingResponse[]> {
    const relevantAssets = new Map<string, DenomMetadata>();

    let assetCursor = await this.db.transaction('ASSETS').store.openCursor();

    while (assetCursor) {
      const isDelegationAssetType = new RegExp('udelegation_.*');

      const denomMetadata = DenomMetadata.fromJson(assetCursor.value);

      if (isDelegationAssetType.test(denomMetadata.base) && denomMetadata.penumbraAssetId) {
        relevantAssets.set(uint8ArrayToHex(denomMetadata.penumbraAssetId.inner), denomMetadata);
      }
      assetCursor = await assetCursor.continue();
    }

    const notesForVoting = [];

    let noteCursor = await this.db.transaction('SPENDABLE_NOTES').store.openCursor();
    while (noteCursor) {
      const note = SpendableNoteRecord.fromJson(noteCursor.value);

      if (addressIndex) {
        if (!note.addressIndex?.equals(addressIndex)) {
          noteCursor = await noteCursor.continue();
          continue;
        }
      }

      if (!note.note?.value?.assetId?.inner) {
        noteCursor = await noteCursor.continue();
        continue;
      }

      const isRelevantAsset = relevantAssets.has(
        uint8ArrayToHex(note.note.value.assetId.inner),
      );
      const noteIsVotable = note.heightSpent === 0n || note.heightSpent > votable_at_height;

      if (isRelevantAsset && noteIsVotable && note.heightCreated < votable_at_height) {
        const asset = relevantAssets.get(uint8ArrayToHex(note.note.value.assetId.inner));

        const bech32idk = asset?.base.replace('udelegation_', '');
        if (bech32idk) {
          notesForVoting.push(
              new NotesForVotingResponse({
                noteRecord: note,
                identityKey: new IdentityKey({ ik:  bech32ToUint8Array(bech32idk) }),
              }),
          );
        }

      }
      noteCursor = await noteCursor.continue();
    }

    return Promise.resolve(notesForVoting);
  }
}
