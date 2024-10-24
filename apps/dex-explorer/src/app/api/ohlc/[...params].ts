import { NextRequest, NextResponse } from 'next/server';
import { DexQueryServiceClient } from '@/shared/old-utils/protos/services/dex/dex-query-service-client';
import { DirectedTradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { base64ToUint8Array } from '@/shared/old-utils/math/base64';
import { fetchAllTokenAssets } from '@/shared/old-utils/token/tokenFetch';

interface Params {
  params: string[];
}

export async function GET(_req: NextRequest, context: { params: Promise<Params> }) {
  const grpcEndpoint = process.env['PENUMBRA_GRPC_ENDPOINT'];
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!grpcEndpoint || !chainId) {
    throw new Error('PENUMBRA_GRPC_ENDPOINT is not set');
  }

  const params = (await context.params).params;
  const tokenIn = params[0] ?? null;
  const tokenOut = params[1] ?? null;
  const startHeight = params[2] ?? null;
  const limit = params[3] ?? null;

  try {
    const tokenAssets = fetchAllTokenAssets(chainId);
    if (!startHeight || !tokenIn || !tokenOut || !limit) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }

    // Set a HARD limit to prevent abuse
    if (parseInt(limit) > 10000) {
      return NextResponse.json({ error: 'Limit exceeded' }, { status: 400 });
    }

    const dex_querier = new DexQueryServiceClient({
      grpcEndpoint: grpcEndpoint,
    });

    const tokenInInner = tokenAssets.find(
      x => x.display.toLowerCase() === tokenIn.toLowerCase(),
    )?.inner;
    const tokenOutInner = tokenAssets.find(
      x => x.display.toLowerCase() === tokenOut.toLowerCase(),
    )?.inner;
    if (!tokenInInner || !tokenOutInner) {
      return NextResponse.json(
        {
          error: `Invalid token pair, a token was not found: ${tokenIn} ${tokenOut}`,
        },
        { status: 400 },
      );
    }

    const tradingPair = new DirectedTradingPair();
    tradingPair.start = new AssetId();
    tradingPair.start.inner = base64ToUint8Array(tokenInInner);
    tradingPair.end = new AssetId();
    tradingPair.end.inner = base64ToUint8Array(tokenOutInner);

    const data = await dex_querier.candlestickData(
      tradingPair,
      parseInt(startHeight),
      parseInt(limit),
    );

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Error getting candlestick by grpc data:', error);
    return NextResponse.json(
      {
        error: `Error getting candlestick by grpc data: ${error as string}`,
      },
      { status: 500 },
    );
  }
}
