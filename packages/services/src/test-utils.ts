import { Mock } from 'vitest';
import {
  FullViewingKey,
  SpendKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';
import {
  IDB_TABLES,
  IdbConstants,
  IdbUpdate,
  IndexedDbInterface,
  PenumbraDb,
} from '@penumbra-zone/types/indexed-db';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import {
  Epoch,
  Nullifier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb.js';
import {
  NotesForVotingResponse,
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb.js';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb.js';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb.js';
import {
  EstimatedPrice,
  Metadata,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { ScanBlockResult, StateCommitmentTree } from '@penumbra-zone/types/state-commitment-tree';
import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb.js';
import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb.js';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb.js';
import { PartialMessage } from '@bufbuild/protobuf';
import {
  AddressIndex,
  IdentityKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import {
  Position,
  PositionId,
  PositionState,
  TradingPair,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb.js';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import {
  AuctionId,
  DutchAuctionDescription,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb.js';
import { StoreNames } from 'idb';

export interface IndexedDbMock {
  constants?: Mock;
  getAppParams?: Mock;
  getAssetsMetadata?: Mock;
  getNativeGasPrices?: Mock;
  getAltGasPrices?: Mock;
  getFmdParams?: Mock;
  getFullSyncHeight?: Mock;
  getNotesForVoting?: Mock;
  getOwnedPositionIds?: () => Partial<AsyncIterable<Mock>>;
  getSpendableNoteByCommitment?: Mock;
  getSpendableNoteByNullifier?: Mock;
  getStateCommitmentTree?: Mock;
  getSwapByNullifier?: Mock;
  getTransaction?: Mock;
  iterateAssetsMetadata?: () => Partial<AsyncIterable<Mock>>;
  iterateSpendableNotes?: () => Partial<AsyncIterable<Mock>>;
  iterateSwaps?: () => Partial<AsyncIterable<Mock>>;
  iterateTransactions?: () => Partial<AsyncIterable<Mock>>;
  iterateValidatorInfos?: () => Partial<AsyncIterable<Mock>>;
  getValidatorInfo?: Mock;
  subscribe?: (table: string) => Partial<AsyncIterable<Mock>>;
  getSwapByCommitment?: Mock;
  getEpochByHeight?: Mock;
  saveAssetsMetadata?: Mock;
  getPricesForAsset?: Mock;
  getAuction?: Mock;
  getAuctionOutstandingReserves?: Mock;
  hasStakingAssetBalance?: Mock;
  stakingTokenAssetId?: Mock;
  upsertAuction?: Mock;
}

export interface AuctionMock {
  auctionStateById: Mock;
}

export interface TendermintMock {
  broadcastTx?: Mock;
  getTransaction?: Mock;
  latestBlockHeight?: Mock;
}

export interface ShieldedPoolMock {
  assetMetadataById: Mock;
}

export interface ViewServerMock {
  fullViewingKey?: FullViewingKey;
}

export interface MockQuerier {
  auction?: AuctionMock;
  tendermint?: TendermintMock;
  shieldedPool?: ShieldedPoolMock;
  stake?: StakeMock;
}

export interface StakeMock {
  validatorPenalty?: Mock;
}

interface MockServicesInner {
  indexedDb?: IndexedDbMock;
  viewServer?: ViewServerMock;
  querier?: MockQuerier;
}

export interface MockServices {
  getWalletServices?: Mock<[], Promise<MockServicesInner>>;
}

export interface MockApproverCtx {
  get: Mock;
}

export const testFullViewingKey = new FullViewingKey(
  fullViewingKeyFromBech32m(
    'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
  ),
);

export const testSpendKey = new SpendKey({
  inner: new Uint8Array([
    204, 36, 107, 26, 105, 251, 139, 204, 14, 247, 98, 33, 115, 24, 32, 181, 165, 4, 171, 182, 171,
    238, 171, 186, 29, 152, 153, 61, 26, 149, 83, 166,
  ]),
});

export class IndexedDbMockImpl implements IndexedDbInterface {
  constructor(public mockDB: IndexedDbMock) {}

  stakingTokenAssetId = new AssetId();

  constants(): IdbConstants {
    return this.mockDB.constants
      ? this.mockDB.constants()
      : { name: 'MockDb', version: 1, tables: IDB_TABLES };
  }

  async clear(): Promise<void> {
    return;
  }

  async getFullSyncHeight(): Promise<bigint | undefined> {
    return this.mockDB.getFullSyncHeight ? this.mockDB.getFullSyncHeight() : undefined;
  }

  async getSpendableNoteByNullifier(
    nullifier: Nullifier,
  ): Promise<SpendableNoteRecord | undefined> {
    return this.mockDB.getSpendableNoteByNullifier
      ? this.mockDB.getSpendableNoteByNullifier(nullifier)
      : undefined;
  }

  async getSpendableNoteByCommitment(
    commitment: StateCommitment,
  ): Promise<SpendableNoteRecord | undefined> {
    return this.mockDB.getSpendableNoteByCommitment
      ? this.mockDB.getSpendableNoteByCommitment(commitment)
      : undefined;
  }

  async saveSpendableNote(_note: SpendableNoteRecord): Promise<void> {
    return;
  }

  async *iterateSpendableNotes(): AsyncGenerator<SpendableNoteRecord, void, unknown> {
    return;
  }

  async saveTransaction(_id: TransactionId, _height: bigint, _tx: Transaction): Promise<void> {
    return;
  }

  async getTransaction(txId: TransactionId): Promise<TransactionInfo | undefined> {
    return this.mockDB.getTransaction ? this.mockDB.getTransaction(txId) : undefined;
  }

  async *iterateTransactions(): AsyncGenerator<TransactionInfo, void, unknown> {
    return;
  }

  async getAssetsMetadata(assetId: AssetId): Promise<Metadata | undefined> {
    return this.mockDB.getAssetsMetadata ? this.mockDB.getAssetsMetadata(assetId) : undefined;
  }

  async saveAssetsMetadata(metadata: Metadata): Promise<void> {
    return this.mockDB.saveAssetsMetadata ? this.mockDB.saveAssetsMetadata(metadata) : undefined;
  }

  async *iterateAssetsMetadata(): AsyncGenerator<Metadata, void, unknown> {
    return;
  }

  async getStateCommitmentTree(): Promise<StateCommitmentTree> {
    return this.mockDB.getStateCommitmentTree ? this.mockDB.getStateCommitmentTree() : undefined;
  }

  async saveScanResult(_updates: ScanBlockResult): Promise<void> {
    return;
  }

  async getFmdParams(): Promise<FmdParameters | undefined> {
    return this.mockDB.getFmdParams ? this.mockDB.getFmdParams() : undefined;
  }

  async saveFmdParams(_params: FmdParameters): Promise<void> {
    return;
  }

  async getAppParams(): Promise<AppParameters | undefined> {
    return this.mockDB.getAppParams ? this.mockDB.getAppParams() : undefined;
  }

  async saveAppParams(_params: AppParameters): Promise<void> {
    return;
  }

  async *iterateSwaps(): AsyncGenerator<SwapRecord, void, unknown> {
    return;
  }

  async getSwapByNullifier(nullifier: Nullifier): Promise<SwapRecord | undefined> {
    return this.mockDB.getSwapByNullifier ? this.mockDB.getSwapByNullifier(nullifier) : undefined;
  }

  async saveSwap(_note: SwapRecord): Promise<void> {
    return;
  }

  async getSwapByCommitment(commitment: StateCommitment): Promise<SwapRecord | undefined> {
    return this.mockDB.getSwapByCommitment
      ? this.mockDB.getSwapByCommitment(commitment)
      : undefined;
  }

  async getNativeGasPrices(): Promise<GasPrices | undefined> {
    return this.mockDB.getNativeGasPrices ? this.mockDB.getNativeGasPrices() : undefined;
  }

  async getAltGasPrices(): Promise<GasPrices[]> {
    return this.mockDB.getAltGasPrices ? this.mockDB.getAltGasPrices() : [];
  }

  async saveGasPrices(_value: PartialMessage<GasPrices>): Promise<void> {
    return;
  }

  async getNotesForVoting(
    addressIndex: AddressIndex | undefined,
    votableAtHeight: bigint,
  ): Promise<NotesForVotingResponse[]> {
    return this.mockDB.getNotesForVoting
      ? this.mockDB.getNotesForVoting(addressIndex, votableAtHeight)
      : [];
  }

  async *getOwnedPositionIds(
    _positionState: PositionState | undefined,
    _tradingPair: TradingPair | undefined,
  ): AsyncGenerator<PositionId, void, unknown> {
    return;
  }

  async addPosition(_positionId: PositionId, _position: Position): Promise<void> {
    return;
  }

  async updatePosition(_positionId: PositionId, _newState: PositionState): Promise<void> {
    return;
  }

  async addEpoch(_startHeight: bigint): Promise<void> {
    return;
  }

  async getEpochByHeight(height: bigint): Promise<Epoch | undefined> {
    return this.mockDB.getEpochByHeight ? this.mockDB.getEpochByHeight(height) : undefined;
  }

  async upsertValidatorInfo(_validatorInfo: ValidatorInfo): Promise<void> {
    return;
  }

  async *iterateValidatorInfos(): AsyncGenerator<ValidatorInfo, void, unknown> {
    return;
  }

  async getValidatorInfo(identityKey: IdentityKey): Promise<ValidatorInfo | undefined> {
    return this.mockDB.getValidatorInfo ? this.mockDB.getValidatorInfo(identityKey) : undefined;
  }

  async updatePrice(
    _pricedAsset: AssetId,
    _numeraire: AssetId,
    _numerairePerUnit: number,
    _height: bigint,
  ): Promise<void> {
    return;
  }

  async getPricesForAsset(
    assetMetadata: Metadata,
    latestBlockHeight: bigint,
    epochDuration: bigint,
  ): Promise<EstimatedPrice[]> {
    return this.mockDB.getPricesForAsset
      ? this.mockDB.getPricesForAsset(assetMetadata, latestBlockHeight, epochDuration)
      : [];
  }

  async clearSwapBasedPrices(): Promise<void> {
    return;
  }

  async upsertAuction<T extends DutchAuctionDescription>(
    _auctionId: AuctionId,
    _value: { auction?: T; noteCommitment?: StateCommitment; seqNum?: bigint },
  ): Promise<void> {
    return;
  }

  async getAuction(auctionId: AuctionId): Promise<{
    auction?: DutchAuctionDescription;
    noteCommitment?: StateCommitment;
    seqNum?: bigint;
  }> {
    return this.mockDB.getAuction ? this.mockDB.getAuction(auctionId) : {};
  }

  async addAuctionOutstandingReserves(
    _auctionId: AuctionId,
    _value: { input: Value; output: Value },
  ): Promise<void> {
    return;
  }

  async deleteAuctionOutstandingReserves(_auctionId: AuctionId): Promise<void> {
    return;
  }

  async getAuctionOutstandingReserves(
    auctionId: AuctionId,
  ): Promise<{ input: Value; output: Value } | undefined> {
    return this.mockDB.getAuctionOutstandingReserves
      ? this.mockDB.getAuctionOutstandingReserves(auctionId)
      : undefined;
  }

  async hasStakingAssetBalance(addressIndex: AddressIndex | undefined): Promise<boolean> {
    return this.mockDB.hasStakingAssetBalance
      ? this.mockDB.hasStakingAssetBalance(addressIndex)
      : false;
  }

  async *subscribe<DBTypes extends PenumbraDb, StoreName extends StoreNames<DBTypes>>(
    _table: StoreName,
  ): AsyncGenerator<IdbUpdate<DBTypes, StoreName>, void, unknown> {
    return;
  }
}
