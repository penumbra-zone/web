import {
  AppParameters,
  KeyValueResponse_Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1alpha1/app_pb';
import { ChainParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/compact_block/v1alpha1/compact_block_pb';
import { GetBlockByHeightResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/util/tendermint_proxy/v1alpha1/tendermint_proxy_pb';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import {
  QueryClientStatesRequest,
  QueryClientStatesResponse,
} from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/query_pb';

export interface RootQuerierInterface {
  app: AppQuerierInterface;
  compactBlock: CompactBlockQuerierInterface;
  tendermint: TendermintQuerierInterface;
  shieldedPool: ShieldedPoolQuerierInterface;
  ibcClient: IbcClientQuerierInterface;
}

export interface AppQuerierInterface {
  appParams(): Promise<AppParameters>;
  chainParams(): Promise<ChainParameters>;
  keyValue(key: string): Promise<KeyValueResponse_Value['value']>;
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
  latestBlockHeight(): Promise<bigint>;
  getBlock(height: bigint): Promise<GetBlockByHeightResponse>;
}

export interface ShieldedPoolQuerierInterface {
  denomMetadata(assetId: AssetId): Promise<DenomMetadata | undefined>;
}

export interface IbcClientQuerierInterface {
  ibcClientStates(req: QueryClientStatesRequest): Promise<QueryClientStatesResponse>;
}
