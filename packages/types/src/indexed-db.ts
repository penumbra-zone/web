import { DBSchema, StoreKey, StoreNames, StoreValue } from 'idb';

import {
  ScanBlockResult,
  StateCommitmentTree,
  StoreCommitment,
  StoredPosition,
  StoreHash,
} from './state-commitment-tree';

import {
  NotesForVotingResponse,
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  FmdParameters,
  Note,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1alpha1/tct_pb';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import {
  Position,
  PositionId,
  PositionState,
  TradingPair,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1alpha1/dex_pb';
import { Jsonified } from './jsonified';
import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1alpha1/app_pb';

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
  getSpendableNoteByNullifier(nullifier: Nullifier): Promise<SpendableNoteRecord | undefined>;
  getSpendableNoteByCommitment(
    commitment: StateCommitment,
  ): Promise<SpendableNoteRecord | undefined>;
  saveSpendableNote(note: SpendableNoteRecord): Promise<void>;
  getAllSpendableNotes(): Promise<SpendableNoteRecord[]>;
  saveTransactionInfo(tx: TransactionInfo): Promise<void>;
  getTransactionInfo(txId: TransactionId): Promise<TransactionInfo | undefined>;
  getAllTransactionInfo(): Promise<TransactionInfo[]>;
  getAssetsMetadata(assetId: AssetId): Promise<Metadata | undefined>;
  saveAssetsMetadata(metadata: Metadata): Promise<void>;
  getAllAssetsMetadata(): Promise<Metadata[]>;
  getStateCommitmentTree(): Promise<StateCommitmentTree>;
  saveScanResult(updates: ScanBlockResult): Promise<void>;
  getFmdParams(): Promise<FmdParameters | undefined>;
  saveFmdParams(params: FmdParameters): Promise<void>;
  getAppParams(): Promise<AppParameters | undefined>;
  saveAppParams(params: AppParameters): Promise<void>;
  getAllSwaps(): Promise<SwapRecord[]>;
  getSwapByNullifier(nullifier: Nullifier): Promise<SwapRecord | undefined>;
  saveSwap(note: SwapRecord): Promise<void>;
  getSwapByCommitment(commitment: StateCommitment): Promise<SwapRecord | undefined>;
  getGasPrices(): Promise<GasPrices | undefined>;
  saveGasPrices(value: GasPrices): Promise<void>;
  getNotesForVoting(
    addressIndex: AddressIndex | undefined,
    votableAtHeight: bigint,
  ): Promise<NotesForVotingResponse[]>;
  getOwnedPositionIds(
    positionState: PositionState | undefined,
    tradingPair: TradingPair | undefined,
  ): AsyncGenerator<PositionId, void>;
  addPosition(positionId: PositionId, position: Position): Promise<void>;
  updatePosition(positionId: PositionId, newState: PositionState): Promise<void>;
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
    key: number; // autoincrement
    value: StoreHash;
  };
  TREE_COMMITMENTS: {
    key: StoreCommitment['commitment']['inner']; // base64
    value: StoreCommitment;
  };
  APP_PARAMETERS: {
    key: 'params';
    value: Jsonified<AppParameters>;
  };
  FMD_PARAMETERS: {
    key: 'params';
    value: Jsonified<FmdParameters>;
  };
  TRANSACTION_INFO: {
    key: Jsonified<Required<TransactionInfo>['id']['inner']>; // base64
    value: Jsonified<TransactionInfo>;
  };
  // ======= Json serialized values =======
  // Allows wasm crate to directly deserialize
  ASSETS: {
    key: Jsonified<Required<Metadata>['penumbraAssetId']['inner']>; // base64
    value: Jsonified<Metadata>;
  };
  SPENDABLE_NOTES: {
    key: Jsonified<Required<SpendableNoteRecord>['noteCommitment']['inner']>; // base64
    value: Jsonified<SpendableNoteRecord>;
    indexes: {
      nullifier: Jsonified<Required<SpendableNoteRecord>['nullifier']['inner']>; // base64
    };
  };
  // Store for Notes that have been detected but cannot yet be spent
  // Used in wasm crate to process swap and swap claim
  // This table is never written or queried by typescript
  NOTES: {
    // key is not part of the stored object
    key: Jsonified<StateCommitment['inner']>; // base64
    value: Jsonified<Note>;
  };
  SWAPS: {
    key: Jsonified<Required<SwapRecord>['swapCommitment']['inner']>; // base64
    value: Jsonified<SwapRecord>;
    indexes: {
      nullifier: Jsonified<Required<SwapRecord>['nullifier']['inner']>; // base64
    };
  };
  GAS_PRICES: {
    key: 'gas_prices';
    value: GasPrices;
  };
  POSITIONS: {
    key: string; // base64 PositionRecord['id']['inner'];
    value: PositionRecord;
  };
}

// need to store PositionId and Position in the same table
export interface PositionRecord {
  id: Jsonified<PositionId>; // PositionId (must be JsonValue because ['id']['inner'] is a key )
  position: Jsonified<Position>; // Position
}

export type PenumbraTables = StoreNames<PenumbraDb>;

// Must be kept in sync with: https://github.com/penumbra-zone/penumbra/blob/02462635d6c825019822cbeeb44d422cf900f25d/crates/wasm/src/storage.rs#L15C1-L30
export interface IdbConstants {
  name: string;
  version: number;
  tables: Record<string, PenumbraTables>;
}

export const IDB_TABLES: Record<string, PenumbraTables> = {
  assets: 'ASSETS',
  notes: 'NOTES',
  spendable_notes: 'SPENDABLE_NOTES',
  swaps: 'SWAPS',
};
