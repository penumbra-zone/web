import { NextRequest, NextResponse } from 'next/server';
import { DexQueryServiceClient } from '@/shared/utils/protos/services/dex/dex-query-service-client';
import { DirectedTradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { base64ToUint8Array } from '@/shared/utils/base64';
import { fetchAllTokenAssets } from '@/shared/api/server/token-fetch';

interface Params {
  params: string[];
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const grpcEndpoint = process.env['PENUMBRA_GRPC_ENDPOINT'];
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!grpcEndpoint || !chainId) {
    throw new Error('PENUMBRA_GRPC_ENDPOINT or PENUMBRA_CHAIN_ID is not set');
  }

  const { params } = await context.params;
  const token1 = params[0] ?? null;
  const token2 = params[1] ?? null;
  const limit = params[2] ?? null;

  try {
    if (!token1 || !token2 || !limit) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    // Get token 1 & 2
    const tokenAssets = fetchAllTokenAssets(chainId);
    const asset1Token = tokenAssets.find(
      x => x.display.toLocaleLowerCase() === token1.toLocaleLowerCase(),
    );
    const asset2Token = tokenAssets.find(
      x => x.display.toLocaleLowerCase() === token2.toLocaleLowerCase(),
    );

    if (!asset1Token || !asset2Token) {
      return NextResponse.json(
        { error: 'Could not find requested token in registry' },
        { status: 400 },
      );
    }

    const lp_querier = new DexQueryServiceClient({
      grpcEndpoint: grpcEndpoint,
    });

    const tradingPair = new DirectedTradingPair({
      start: {
        inner: base64ToUint8Array(asset1Token.inner),
      },
      end: {
        inner: base64ToUint8Array(asset2Token.inner),
      },
    });

    const data = await lp_querier.liquidityPositionsByPrice(tradingPair, Number(limit));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting liquidty positions by price grpc data:', error);
    return NextResponse.json(
      {
        error: `Error getting liquidty positions by price grpc data: ${error as string}`,
      },
      { status: 500 },
    );
  }
}
