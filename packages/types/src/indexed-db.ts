import { DBSchema, StoreKey, StoreNames, StoreValue } from 'idb';
import {
  ScanResult,
  StateCommitmentTree,
  StoreCommitment,
  StoredPosition,
  StoreHash,
} from './state-commitment-tree';
import {
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  FmdParameters,
  NoteSource,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { Note } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { Base64Str } from './base64';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';

export interface IdbUpdate<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>> {
  table: StoreName;
  value: StoreValue<DBTypes, StoreName>;
  key?: StoreKey<DBTypes, StoreName> | IDBKeyRange;
}

export interface IndexedDbInterface {
  subscribe<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
    table: StoreName,
  ): AsyncGenerator<IdbUpdate<DBTypes, StoreName>, void>;
  constants(): IdbConstants;
  clear(): Promise<void>;
  getLastBlockSynced(): Promise<bigint | undefined>;
  getNoteByNullifier(nullifier: Nullifier): Promise<SpendableNoteRecord | undefined>;
  getNoteByCommitment(commitment: StateCommitment): Promise<SpendableNoteRecord | undefined>;
  saveSpendableNote(note: SpendableNoteRecord): Promise<void>;
  getAllNotes(): Promise<SpendableNoteRecord[]>;
  saveTransactionInfo(tx: TransactionInfo): Promise<void>;
  getTransaction(source: NoteSource): Promise<TransactionInfo | undefined>;
  getAllTransactions(): Promise<TransactionInfo[]>;
  getAssetsMetadata(assetId: AssetId): Promise<DenomMetadata | undefined>;
  saveAssetsMetadata(metadata: DenomMetadata): Promise<void>;
  getAllAssetsMetadata(): Promise<DenomMetadata[]>;
  getStateCommitmentTree(): Promise<StateCommitmentTree>;
  saveScanResult(updates: ScanResult): Promise<void>;
  getFmdParams(): Promise<FmdParameters | undefined>;
  saveFmdParams(params: FmdParameters): Promise<void>;
  getAllSwaps(): Promise<SwapRecord[]>;
  getSwapByNullifier(nullifier: Nullifier): Promise<SwapRecord | undefined>;
  saveSwap(note: SwapRecord): Promise<void>;
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
    value: bigint;
  };
  TREE_HASHES: {
    key: number;
    value: StoreHash;
  };
  TREE_COMMITMENTS: {
    key: StoreCommitment['commitment']['inner'];
    value: StoreCommitment;
  };
  FMD_PARAMETERS: {
    key: 'params';
    value: FmdParameters;
  };
  TRANSACTIONS: {
    key: NoteSource['inner'];
    value: TransactionInfo;
  };
  // ======= Json serialized values =======
  // Allows wasm crate to directly deserialize
  ASSETS: {
    key: Base64Str; // Jsonified<DenomMetadata['penumbraAssetId']['inner']>
    value: Jsonified<DenomMetadata>;
  };
  SPENDABLE_NOTES: {
    key: Base64Str; // Jsonified<SpendableNoteRecord['noteCommitment']['inner']>
    value: Jsonified<SpendableNoteRecord>;
    indexes: {
      nullifier: Base64Str; // Jsonified<SpendableNoteRecord['nullifier']['inner']>
    };
  };
  // Store for Notes that have been detected but cannot yet be spent
  // Used in wasm crate to process swap and swap claim
  NOTES: {
    key: Base64Str; // Jsonified<StateCommitment>  key is not part of the stored object
    value: Jsonified<Note>;
  };
  SWAPS: {
    key: Base64Str; // Jsonified<SwapRecord['swapCommitment']['inner']>
    value: Jsonified<SwapRecord>;
    indexes: {
      nullifier: Base64Str; // Jsonified<SwapRecord['nullifier']['inner']>
    };
  };
}

// @ts-expect-error Meant to be a marker to indicate it's json serialized.
//                  Protobuf values often need to be as they are json-deserialized in the wasm crate.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Jsonified<T> = JsonValue;

export type Tables = Record<string, StoreNames<PenumbraDb>>;

// Must be kept in sync with: https://github.com/penumbra-zone/penumbra/blob/02462635d6c825019822cbeeb44d422cf900f25d/crates/wasm/src/storage.rs#L15C1-L30
export interface IdbConstants {
  name: string;
  version: number;
  tables: Tables;
}

export const IDB_TABLES: Tables = {
  assets: 'ASSETS',
  notes: 'NOTES',
  spendable_notes: 'SPENDABLE_NOTES',
  swaps: 'SWAPS',
};
