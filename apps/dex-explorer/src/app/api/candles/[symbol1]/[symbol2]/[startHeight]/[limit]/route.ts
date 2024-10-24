import { NextRequest, NextResponse } from 'next/server';
import { DexQueryServiceClient } from '@/shared/old-utils/protos/services/dex/dex-query-service-client';
import { IndexerQuerier } from '@/shared/old-utils/indexer/connector';
import {
  CandlestickData,
  DirectedTradingPair,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { base64ToUint8Array } from '@/shared/old-utils/math/base64';
import { fetchAllTokenAssets } from '@/shared/old-utils/token/tokenFetch';
import { createMergeCandles } from '@/utils/candles';
import { Token } from '@/shared/old-utils/types/token';

interface QueryParams {
  symbol1?: string;
  symbol2?: string;
  startHeight?: string;
  limit?: string;
}

interface Candle extends Omit<CandlestickData, 'height'> {
  height: string;
  time: number;
}

function getTokenAssetBySymbol(tokenAssets: Token[], symbol: string): Token | undefined {
  const regex = new RegExp(`^${symbol}$`, 'i');
  return tokenAssets.find(asset => regex.test(asset.symbol));
}

function getDirectedTradingPair(assetIn: Token, assetOut: Token) {
  const tradingPair = new DirectedTradingPair();
  tradingPair.start = new AssetId();
  tradingPair.start.inner = base64ToUint8Array(assetIn.inner);
  tradingPair.end = new AssetId();
  tradingPair.end.inner = base64ToUint8Array(assetOut.inner);
  return tradingPair;
}

function fillBlocks(startHeight: number, endHeight: number) {
  return Array.from({ length: endHeight - startHeight + 1 }, (_, i) => startHeight + i);
}

async function getTimestampsByBlockheight(
  startHeight: number,
  limit: number,
): Promise<Record<string, string>> {
  const indexerQuerier = new IndexerQuerier(process.env['PENUMBRA_INDEXER_ENDPOINT'] ?? '');

  if (startHeight === 0) {
    const endHeight = await indexerQuerier
      .fetchMostRecentNBlocks(1)
      .then(resp => Number(resp[0]?.height));

    if (!endHeight) {
      return {};
    }

    const startHeight = endHeight - limit;
    const data = await indexerQuerier.fetchBlocksByHeight(fillBlocks(startHeight, endHeight));
    const timestampsByHeight = Object.fromEntries(
      data.map(block => [block.height.toString(), block.created_at]),
    );

    return timestampsByHeight;
  }

  const endHeight = startHeight + limit;
  const data = await indexerQuerier.fetchBlocksByHeight(fillBlocks(startHeight, endHeight));
  const timestampsByHeight = Object.fromEntries(
    data.map(block => [block.height.toString(), block.created_at]),
  );
  return timestampsByHeight;
}

export async function GET(_req: NextRequest, context: { params: Promise<QueryParams> }) {
  const {
    symbol1,
    symbol2,
    startHeight: startHeightQuery,
    limit: limitQuery,
  } = await context.params;
  const startHeight = Number(startHeightQuery);
  const limit = Number(limitQuery);

  if ((!startHeight && startHeight !== 0) || !symbol1 || !symbol2 || !limit) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  // Set a HARD limit to prevent abuse
  if (limit > 10000) {
    return NextResponse.json({ error: 'Limit exceeded' }, { status: 400 });
  }

  const tokenAssets = fetchAllTokenAssets(process.env['PENUMBRA_CHAIN_ID'] ?? '');
  const asset1 = getTokenAssetBySymbol(tokenAssets, symbol1);
  const asset2 = getTokenAssetBySymbol(tokenAssets, symbol2);

  if (!asset1 || !asset2) {
    return NextResponse.json(
      {
        error: `Invalid token pair ${symbol1}:${symbol2}`,
      },
      { status: 400 },
    );
  }

  const dexQuerier = new DexQueryServiceClient({
    grpcEndpoint: process.env['PENUMBRA_GRPC_ENDPOINT'] ?? '',
  });
  const tradingPair = getDirectedTradingPair(asset1, asset2);
  const reversePair = getDirectedTradingPair(asset2, asset1);

  const [candlesFwd, candlesRev, timestampsByHeight] = await Promise.all([
    dexQuerier.candlestickData(tradingPair, startHeight, limit),
    dexQuerier.candlestickData(reversePair, startHeight, limit),
    getTimestampsByBlockheight(startHeight, limit),
  ]);

  const mergeCandles = createMergeCandles(asset1, asset2);
  const mergedCandles = mergeCandles(candlesFwd, candlesRev);

  const candlesWithTime = mergedCandles
    .map(
      (candle: CandlestickData) =>
        ({
          ...candle,
          height: candle.height.toString(),
          time: new Date(timestampsByHeight[candle.height.toString()] ?? '').getTime(),
        }) as Candle,
    )
    .filter(candle => !Number.isNaN(candle.time));

  return NextResponse.json(candlesWithTime);
}
