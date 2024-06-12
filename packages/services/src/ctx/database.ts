import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import {
  AssetId,
  EstimatedPrice,
  Metadata,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  AuctionId,
  DutchAuctionDescription,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import {
  Position,
  PositionId,
  PositionState,
  TradingPair,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import {
  Epoch,
  Nullifier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import {
  AddressIndex,
  IdentityKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import {
  NotesForVotingResponse,
  SpendableNoteRecord,
  SwapRecord,
  TransactionInfo,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { Code, ConnectError, createContextKey } from '@connectrpc/connect';
import { ScanBlockResult, StateCommitmentTree } from '@penumbra-zone/types/state-commitment-tree';

export const dbCtx = createContextKey<() => Promise<DatabaseCtx>>(() =>
  Promise.reject(new ConnectError('No database available', Code.FailedPrecondition)),
);

const IDB_TABLES = {
  assets: 'ASSETS',
  auctions: 'AUCTIONS',
  auction_outstanding_reserves: 'AUCTION_OUTSTANDING_RESERVES',
  advice_notes: 'ADVICE_NOTES',
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
} as const;

export interface DatabaseCtx {
  name: string;
  version: number;
  constants(): { name: string; version: number; tables: typeof IDB_TABLES };

  subscribeFullSyncHeight(): AsyncGenerator<bigint, void>;
  subscribeTransactionInfo(): AsyncGenerator<TransactionInfo, void>;
  subscribeSpendableNoteRecords(): AsyncGenerator<SpendableNoteRecord, void>;
  subscribeSwapRecords(): AsyncGenerator<SwapRecord, void>;

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
  saveGasPrices(value: PartialMessage<GasPrices>): Promise<void>;
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
  getValidatorInfo(identityKey: IdentityKey): Promise<ValidatorInfo | undefined>;
  updatePrice(
    pricedAsset: AssetId,
    numeraire: AssetId,
    numerairePerUnit: number,
    height: bigint,
  ): Promise<void>;
  getPricesForAsset(assetMetadata: Metadata, latestBlockHeight: bigint): Promise<EstimatedPrice[]>;

  // Add more auction union types as they are created
  upsertAuction<T extends DutchAuctionDescription>(
    auctionId: AuctionId,
    value: {
      auction?: T;
      noteCommitment?: StateCommitment;
      seqNum?: bigint;
    },
  ): Promise<void>;

  getAuction(auctionId: AuctionId): Promise<{
    // Add more auction union types as they are created
    auction?: DutchAuctionDescription;
    noteCommitment?: StateCommitment;
    seqNum?: bigint;
  }>;

  addAuctionOutstandingReserves(
    auctionId: AuctionId,
    value: {
      input: Value;
      output: Value;
    },
  ): Promise<void>;

  deleteAuctionOutstandingReserves(auctionId: AuctionId): Promise<void>;

  getAuctionOutstandingReserves(
    auctionId: AuctionId,
  ): Promise<{ input: Value; output: Value } | undefined>;
}
