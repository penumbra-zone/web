import { SpendableNoteRecord, StoreCommitment, StoredPosition, StoredTree, StoreHash } from './tct';
import { DBSchema } from 'idb';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb';

export interface IndexedDbInterface {
  getLastBlockSynced(): Promise<bigint | undefined>;
  saveLastBlockSynced(height: bigint): Promise<void>;
  saveSpendableNote(note: SpendableNoteRecord): Promise<void>;
  saveAssetsMetadata(metadata: DenomMetadata): Promise<void>;
  loadStoredTree(): Promise<StoredTree>;
}

export interface PenumbraDb extends DBSchema {
  assets: {
    key: Uint8Array;
    value: DenomMetadata;
  };
  nct_position: {
    key: 'position';
    value: StoredPosition;
  };
  nct_forgotten: {
    key: 'forgotten';
    value: Uint8Array;
  };
  nct_commitments: {
    key: string;
    value: StoreCommitment;
  };
  nct_hashes: {
    key: string;
    value: StoreHash;
  };
  last_block_synced: {
    key: 'last_block';
    value: bigint;
  };
  spendable_notes: {
    key: Uint8Array;
    value: SpendableNoteRecord;
  };
}
