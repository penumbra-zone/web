import { DBSchema } from 'idb';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb';
import {
  NctUpdates,
  NewNoteRecord,
  StateCommitmentTree,
  StoreCommitment,
  StoredPosition,
  StoreHash,
} from './state-commitment-tree';
import { Base64Str } from './base64';

export interface IndexedDbInterface {
  getLastBlockSynced(): Promise<bigint | undefined>;
  getNoteByNullifier(nullifier: Base64Str): Promise<NewNoteRecord | undefined>;
  saveSpendableNote(note: NewNoteRecord): Promise<void>;
  getAssetsMetadata(assetId: Uint8Array): Promise<DenomMetadata | undefined>;
  saveAssetsMetadata(metadata: DenomMetadata): Promise<void>;
  getStateCommitmentTree(): Promise<StateCommitmentTree>;
  updateStateCommitmentTree(updates: NctUpdates, height: bigint): Promise<void>;
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
    key: Uint8Array;
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
}
