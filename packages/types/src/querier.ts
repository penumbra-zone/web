import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1/compact_block_pb';
import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  QueryClientStatesRequest,
  QueryClientStatesResponse,
} from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/query_pb';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import {
  ValidatorInfoRequest,
  ValidatorInfoResponse,
  ValidatorPenaltyRequest,
  ValidatorPenaltyResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { MerkleRoot } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import {
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';

export interface RootQuerierInterface {
  app: AppQuerierInterface;
  compactBlock: CompactBlockQuerierInterface;
  tendermint: TendermintQuerierInterface;
  shieldedPool: ShieldedPoolQuerierInterface;
  ibcClient: IbcClientQuerierInterface;
  stake: StakeQuerierInterface;
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
