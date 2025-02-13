import {
  QueryClientStatesRequest,
  QueryClientStatesResponse,
} from '@penumbra-zone/protobuf/ibc/core/client/v1/query_pb';
import { AppParameters } from '@penumbra-zone/protobuf/penumbra/core/app/v1/app_pb';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  AuctionId,
  DutchAuction,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { CompactBlock } from '@penumbra-zone/protobuf/penumbra/core/component/compact_block/v1/compact_block_pb';
import { LqtCheckNullifierResponse } from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';
import {
  Nullifier,
  TimestampByHeightRequest,
  TimestampByHeightResponse,
} from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import {
  GetValidatorInfoRequest,
  GetValidatorInfoResponse,
  ValidatorInfoRequest,
  ValidatorInfoResponse,
  ValidatorPenaltyRequest,
  ValidatorPenaltyResponse,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { Transaction } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { MerkleRoot } from '@penumbra-zone/protobuf/penumbra/crypto/tct/v1/tct_pb';

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
  funding: FundingQuerierInterface;
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
  validatorInfo(req: GetValidatorInfoRequest): Promise<GetValidatorInfoResponse>;
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

export interface FundingQuerierInterface {
  lqtCheckNullifier(epochIndex: bigint, nullifier: Nullifier): Promise<LqtCheckNullifierResponse>;
}
