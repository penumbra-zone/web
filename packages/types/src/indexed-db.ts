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
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  AssetId,
  EstimatedPrice,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  FmdParameters,
  Note,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import {
  Epoch,
  Nullifier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  Position,
  PositionId,
  PositionState,
  TradingPair,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import type { Jsonified } from './jsonified';
import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

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
  getFullSyncHeight(): Promise<bigint | undefined>;
  getSpendableNoteByNullifier(nullifier: Nullifier): Promise<SpendableNoteRecord | undefined>;
  getSpendableNoteByCommitment(
    commitment: StateCommitment,
  ): Promise<SpendableNoteRecord | undefined>;
  saveSpendableNote(note: SpendableNoteRecord): Promise<void>;
  iterateSpendableNotes(): AsyncGenerator<SpendableNoteRecord, void>;
  saveTransaction(id: TransactionId, height: bigint, tx: Transaction): Promise<void>;
  getTransaction(txId: TransactionId): Promise<TransactionInfo | undefined>;
  iterateTransactions(): AsyncGenerator<TransactionInfo, void>;
  getAssetsMetadata(assetId: AssetId): Promise<Metadata | undefined>;
  saveAssetsMetadata(metadata: Metadata): Promise<void>;
  iterateAssetsMetadata(): AsyncGenerator<Metadata, void>;
  getStateCommitmentTree(): Promise<StateCommitmentTree>;
  saveScanResult(updates: ScanBlockResult): Promise<void>;
  getFmdParams(): Promise<FmdParameters | undefined>;
  saveFmdParams(params: FmdParameters): Promise<void>;
  getAppParams(): Promise<AppParameters | undefined>;
  saveAppParams(params: AppParameters): Promise<void>;
  iterateSwaps(): AsyncGenerator<SwapRecord, void>;
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
  addEpoch(startHeight: bigint): Promise<void>;
  getEpochByHeight(height: bigint): Promise<Epoch | undefined>;
  upsertValidatorInfo(validatorInfo: ValidatorInfo): Promise<void>;
  iterateValidatorInfos(): AsyncGenerator<ValidatorInfo, void>;
  updatePrice(
    pricedAsset: AssetId,
    numeraire: AssetId,
    numerairePerUnit: number,
    height: bigint,
  ): Promise<void>;
  getPricesForAsset(assetId: AssetId): Promise<EstimatedPrice[]>;
}

export interface PenumbraDb extends DBSchema {
  FULL_SYNC_HEIGHT: {
    key: 'height';
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
  TRANSACTIONS: {
    key: string; // base64 TransactionInfo['id']['inner'];
    value: Jsonified<TransactionInfo>; // TransactionInfo with undefined view and perspective
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
  EPOCHS: {
    key: number; // auto-increment
    value: Jsonified<Epoch>;
  };
  VALIDATOR_INFOS: {
    key: string; // bech32-encoded validator identity key
    value: Jsonified<ValidatorInfo>;
  };
  PRICES: {
    key: [
      Jsonified<Required<EstimatedPrice>['pricedAsset']['inner']>,
      Jsonified<Required<EstimatedPrice>['numeraire']['inner']>,
    ]; // composite key
    value: Jsonified<EstimatedPrice>;
    indexes: {
      pricedAsset: Jsonified<Required<EstimatedPrice>['pricedAsset']['inner']>;
    };
  };
}

// need to store PositionId and Position in the same table
export interface PositionRecord {
  id: Jsonified<PositionId>; // PositionId (must be JsonValue because ['id']['inner'] is a key )
  position: Jsonified<Position>; // Position
}

export type Tables = Record<string, StoreNames<PenumbraDb>>;
export type PenumbraStoreNames = StoreNames<PenumbraDb>;

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
  fmd_parameters: 'FMD_PARAMETERS',
  app_parameters: 'APP_PARAMETERS',
  gas_prices: 'GAS_PRICES',
  epochs: 'EPOCHS',
  prices: 'PRICES',
  validator_infos: 'VALIDATOR_INFOS',
  transactions: 'TRANSACTIONS',
  full_sync_height: 'FULL_SYNC_HEIGHT',
};
