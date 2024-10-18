import { NextResponse } from 'next/server';
import { DexQueryServiceClient } from '@/old/utils/protos/services/dex/dex-query-service-client';
import { DirectedTradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';

interface Params {
  symbol1: string;
  symbol2: string;
  hops: string;
  limit: string;
}

function getMetadataBySymbol(metadata: Metadata[], symbol: string): Metadata | undefined {
  const regex = new RegExp(`^${symbol}$`, 'i');
  return metadata.find(asset => regex.test(asset.symbol));
}

export async function GET(_request: Request, context: { params: Params }) {
  const { symbol1, symbol2, hops: hopsParam, limit: limitParam } = context.params;
  const hops = Number(hopsParam);
  const limit = Number(limitParam);

  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    throw new Error('No chain id in env vars');
  }

  const grpcEndpoint = process.env['PENUMBRA_GRPC_ENDPOINT'] ?? '';
  if (!grpcEndpoint) {
    throw new Error('No grpc endpoint in env vars');
  }

  const chainRegistryClient = new ChainRegistryClient();
  const registry = await chainRegistryClient.remote.get(chainId);
  const metadata: Metadata[] = registry.getAllAssets();

  const metadata1 = getMetadataBySymbol(metadata, symbol1);
  const metadata2 = getMetadataBySymbol(metadata, symbol2);

  if (!metadata1?.penumbraAssetId || !metadata2?.penumbraAssetId) {
    throw new Error(`No asset id for ${symbol1} or ${symbol2}`);
  }

  const sellSidePair = new DirectedTradingPair({
    start: metadata2.penumbraAssetId,
    end: metadata1.penumbraAssetId,
  });
  const buySidePair = new DirectedTradingPair({
    start: metadata1.penumbraAssetId,
    end: metadata2.penumbraAssetId,
  });

  const querier = new DexQueryServiceClient({ grpcEndpoint });
  const [asks, bids] = await Promise.all([
    querier.liquidityPositionsByPrice(sellSidePair, hops),
    querier.liquidityPositionsByPrice(buySidePair, hops),
  ]);

  const data = {
    asks: asks?.slice(0, limit).map(position => position.toJson()),
    bids: bids?.slice(0, limit).map(position => position.toJson()),
  };

  return NextResponse.json(data);
}
