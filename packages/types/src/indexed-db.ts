import { DBSchema } from 'idb';
import {
  NctUpdates,
  NewNoteRecord,
  StateCommitmentTree,
  StoreCommitment,
  StoredPosition,
  StoreHash,
} from './state-commitment-tree';
import { Base64Str } from './base64';
import { DenomMetadata } from './denom';
import { StoredTransaction } from './transaction/view';

export interface IndexedDbInterface {
  getLastBlockSynced(): Promise<bigint | undefined>;
  getNoteByNullifier(nullifier: Base64Str): Promise<NewNoteRecord | undefined>;
  saveSpendableNote(note: NewNoteRecord): Promise<void>;
  saveTransactionInfo(tx: StoredTransaction): Promise<void>;
  getTransaction(id: StoredTransaction['id']): Promise<StoredTransaction | undefined>;
  getAllTransactions(): Promise<StoredTransaction[]>;
  getAssetsMetadata(assetId: Uint8Array): Promise<DenomMetadata | undefined>;
  saveAssetsMetadata(metadata: DenomMetadata): Promise<void>;
  getStateCommitmentTree(): Promise<StateCommitmentTree>;
  updateStateCommitmentTree(updates: NctUpdates, height: bigint): Promise<void>;
  getAllNotes(): Promise<NewNoteRecord[]>;
}

export interface PenumbraDb extends DBSchema {
  last_block_synced: {
    key: 'last_block';
    value: bigint;
  };
  tree_last_position: {
    key: 'last_position';
    value: StoredPosition;
  };
  tree_last_forgotten: {
    key: 'last_forgotten';
    value: number;
  };
  tree_hashes: {
    key: number;
    value: StoreHash;
  };
  tree_commitments: {
    key: Uint8Array;
    value: StoreCommitment;
  };
  assets: {
    key: Uint8Array;
    value: DenomMetadata;
  };
  spendable_notes: {
    key: Base64Str;
    value: NewNoteRecord;
    indexes: { nullifier: Base64Str };
  };
  transactions: {
    key: Base64Str;
    value: StoredTransaction;
  };
}
