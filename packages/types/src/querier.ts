import {
  AppParameters,
  CompactBlock,
  AssetId,
  Metadata,
  TransactionId,
  Transaction,
  ValidatorInfoRequest,
  ValidatorInfoResponse,
  ValidatorPenaltyRequest,
  ValidatorPenaltyResponse,
  MerkleRoot,
  AuctionId,
  DutchAuction,
  TimestampByHeightRequest,
  TimestampByHeightResponse,
} from '@penumbra-zone/protobuf/types';
import {
  QueryClientStatesRequest,
  QueryClientStatesResponse,
} from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/query_pb.js';

export interface RootQuerierInterface {
  app: AppQuerierInterface;
  compactBlock: CompactBlockQuerierInterface;
  tendermint: TendermintQuerierInterface;
  shieldedPool: ShieldedPoolQuerierInterface;
  ibcClient: IbcClientQuerierInterface;
  stake: StakeQuerierInterface;
  sct: SctQuerierInterface;
  cnidarium: CnidariumQuerierInterface;
  auction: AuctionQuerierInterface;
}

export interface AppQuerierInterface {
  appParams(): Promise<AppParameters>;
  txsByHeight(blockHeight: bigint): Promise<Transaction[]>;
}

export interface CompactBlockRangeParams {
  startHeight: bigint;
  keepAlive: boolean; // Will continuously receive blocks as long as service worker is running
  abortSignal: AbortSignal;
}

export interface CompactBlockQuerierInterface {
  compactBlockRange(params: CompactBlockRangeParams): AsyncIterable<CompactBlock>;
}

export interface TendermintQuerierInterface {
  latestBlockHeight(): Promise<bigint | undefined>;
  broadcastTx(tx: Transaction): Promise<TransactionId>;
  getTransaction(txId: TransactionId): Promise<{ height: bigint; transaction: Transaction }>;
}

export interface ShieldedPoolQuerierInterface {
  assetMetadataById(assetId: AssetId): Promise<Metadata | undefined>;
}

export interface IbcClientQuerierInterface {
  ibcClientStates(req: QueryClientStatesRequest): Promise<QueryClientStatesResponse>;
}

export interface StakeQuerierInterface {
  allValidatorInfos(req: ValidatorInfoRequest): AsyncIterable<ValidatorInfoResponse>;
  validatorPenalty(req: ValidatorPenaltyRequest): Promise<ValidatorPenaltyResponse>;
}

export interface CnidariumQuerierInterface {
  fetchRemoteRoot(blockHeight: bigint): Promise<MerkleRoot>;
}

export interface AuctionQuerierInterface {
  auctionStateById(id: AuctionId): Promise<DutchAuction | undefined>;
}

export interface SctQuerierInterface {
  timestampByHeight(req: TimestampByHeightRequest): Promise<TimestampByHeightResponse>;
}
