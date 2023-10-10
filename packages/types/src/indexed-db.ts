import { DBSchema } from 'idb';
import {
  SctUpdates,
  StateCommitmentTree,
  StoreCommitment,
  StoredPosition,
  StoreHash,
} from './state-commitment-tree';
import { StoredTransaction } from './transaction';
import { SpendableNoteRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { NoteSource } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';

export interface IndexedDbInterface {
  getLastBlockSynced(): Promise<bigint | undefined>;
  getNoteByNullifier(nullifier: Nullifier): Promise<SpendableNoteRecord | undefined>;
  saveSpendableNote(note: SpendableNoteRecord): Promise<void>;
  saveTransactionInfo(tx: StoredTransaction): Promise<void>;
  getTransaction(source: NoteSource): Promise<StoredTransaction | undefined>;
  getAllTransactions(): Promise<StoredTransaction[]>;
  getAssetsMetadata(assetId: AssetId): Promise<DenomMetadata | undefined>;
  saveAssetsMetadata(metadata: DenomMetadata): Promise<void>;
  getStateCommitmentTree(): Promise<StateCommitmentTree>;
  updateStateCommitmentTree(updates: SctUpdates, height: bigint): Promise<void>;
  getAllNotes(): Promise<SpendableNoteRecord[]>;
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
    key: StoreCommitment['commitment']['inner'];
    value: StoreCommitment;
  };
  assets: {
    key: AssetId['inner'];
    value: DenomMetadata;
  };
  spendable_notes: {
    key: StateCommitment['inner'];
    value: SpendableNoteRecord;
    indexes: { nullifier: Nullifier['inner'] };
  };
  transactions: {
    key: NoteSource['inner'];
    value: StoredTransaction;
  };
}
