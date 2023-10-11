import { DBSchema, StoreNames } from 'idb';
import {
  ScanResult,
  StateCommitmentTree,
  StoreCommitment,
  StoredPosition,
  StoreHash,
} from './state-commitment-tree';
import { StoredTransaction } from './transaction';
import {
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  ChainParameters,
  FmdParameters,
  NoteSource,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';
import { Note } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

export interface IndexedDbInterface {
  constants(): IdbConstants;
  getLastBlockSynced(): Promise<bigint | undefined>;
  getNoteByNullifier(nullifier: Nullifier): Promise<SpendableNoteRecord | undefined>;
  saveSpendableNote(note: SpendableNoteRecord): Promise<void>;
  saveTransactionInfo(tx: StoredTransaction): Promise<void>;
  getTransaction(source: NoteSource): Promise<StoredTransaction | undefined>;
  getAllTransactions(): Promise<StoredTransaction[]>;
  getAssetsMetadata(assetId: AssetId): Promise<DenomMetadata | undefined>;
  saveAssetsMetadata(metadata: DenomMetadata): Promise<void>;
  getStateCommitmentTree(): Promise<StateCommitmentTree>;
  saveScanResult(updates: ScanResult): Promise<void>;
  getAllNotes(): Promise<SpendableNoteRecord[]>;
}

export interface PenumbraDb extends DBSchema {
  LAST_BLOCK_SYNCED: {
    key: 'last_block';
    value: bigint;
  };
  TREE_LAST_POSITION: {
    key: 'last_position';
    value: StoredPosition;
  };
  TREE_LAST_FORGOTTEN: {
    key: 'last_forgotten';
    value: number;
  };
  TREE_HASHES: {
    key: number;
    value: StoreHash;
  };
  TREE_COMMITMENTS: {
    key: StoreCommitment['commitment']['inner'];
    value: StoreCommitment;
  };
  ASSETS: {
    key: AssetId['inner'];
    value: DenomMetadata;
  };
  SPENDABLE_NOTES: {
    key: StateCommitment['inner'];
    value: SpendableNoteRecord;
    indexes: { nullifier: Nullifier['inner'] };
  };
  TRANSACTIONS: {
    key: NoteSource['inner'];
    value: StoredTransaction;
  };
  CHAIN_PARAMETERS: {
    key: ChainParameters['chainId'];
    value: ChainParameters;
  };
  NOTES: {
    key: Address['inner'];
    value: Note;
  };
  FMD_PARAMETERS: {
    key: string;
    value: FmdParameters;
  };
  SWAPS: {
    key: StateCommitment['inner'];
    value: SwapRecord;
  };
}

export type Tables = Record<string, StoreNames<PenumbraDb>>;

// Must be kept in sync with: https://github.com/penumbra-zone/penumbra/blob/02462635d6c825019822cbeeb44d422cf900f25d/crates/wasm/src/storage.rs#L15C1-L30
export interface IdbConstants {
  name: string;
  version: number;
  tables: Tables;
}

export const IDB_TABLES: Tables = {
  assets: 'ASSETS',
  chain_parameters: 'CHAIN_PARAMETERS',
  fmd_parameters: 'FMD_PARAMETERS',
  notes: 'NOTES',
  spendable_notes: 'SPENDABLE_NOTES',
  swaps: 'SWAPS',
};
