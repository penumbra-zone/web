import { NextRequest, NextResponse } from 'next/server';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DurationWindow, durationWindows, isDurationWindow } from '@/shared/utils/duration.ts';
import { dbCandleToOhlc, insertEmptyCandles } from '@/shared/api/server/candles/utils.ts';
import { CandleApiResponse } from '@/shared/api/server/candles/types.ts';
import { pindexerDb } from '@/shared/database/client';

const MAINNET_CHAIN_ID = 'penumbra-1';

const getCandles = async ({
  baseAsset,
  quoteAsset,
  window,
  chainId,
  page,
  limit,
}: {
  baseAsset: AssetId;
  quoteAsset: AssetId;
  window: DurationWindow;
  limit?: number;
  page?: number;
  chainId: string;
}) => {
  const filteredCandles = pindexerDb
    .selectFrom('dex_ex_price_charts')
    .select(['start_time', 'open', 'close', 'low', 'high', 'swap_volume', 'direct_volume'])
    .where('the_window', '=', window)
    .where('asset_start', '=', Buffer.from(baseAsset.inner))
    .where('asset_end', '=', Buffer.from(quoteAsset.inner))
    .orderBy('start_time', 'desc')
    // Due to a lot of price volatility at the launch of the chain, manually setting start date a few days later
    .$if(chainId === MAINNET_CHAIN_ID, qb => qb.where('start_time', '>=', new Date('2024-08-06')))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Kysely limitation
    .$if(limit !== undefined, qb => qb.limit(limit!))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Kyseley limitation
    .$if(page !== undefined && limit !== undefined, qb => qb.offset(limit! * (page! - 1)));

  // data needs to be ordered in asc order for the chart to parse it
  return pindexerDb
    .selectFrom(filteredCandles.as('candles'))
    .selectAll()
    .orderBy('start_time', 'asc')
    .execute();
};

export async function GET(req: NextRequest): Promise<NextResponse<CandleApiResponse>> {
  const grpcEndpoint = process.env['PENUMBRA_GRPC_ENDPOINT'];
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!grpcEndpoint || !chainId) {
    return NextResponse.json(
      { error: 'PENUMBRA_GRPC_ENDPOINT or PENUMBRA_CHAIN_ID is not set' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const baseAssetSymbol = searchParams.get('baseAsset');
  const quoteAssetSymbol = searchParams.get('quoteAsset');
  const limit = Number(searchParams.get('limit')) || undefined;
  const page = Number(searchParams.get('page')) || undefined;

  if (!baseAssetSymbol || !quoteAssetSymbol) {
    return NextResponse.json(
      { error: 'Missing required baseAsset or quoteAsset' },
      { status: 400 },
    );
  }
  const durationWindow = searchParams.get('durationWindow');
  if (!durationWindow || !isDurationWindow(durationWindow)) {
    return NextResponse.json(
      { error: `durationWindow missing or invalid window. Options: ${durationWindows.join(', ')}` },
      { status: 400 },
    );
  }

  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);

  // TODO: Add getMetadataBySymbol() helper to registry npm package
  const allAssets = registry.getAllAssets();
  const baseAssetMetadata = allAssets.find(
    a => a.symbol.toLowerCase() === baseAssetSymbol.toLowerCase(),
  );
  const quoteAssetMetadata = allAssets.find(
    a => a.symbol.toLowerCase() === quoteAssetSymbol.toLowerCase(),
  );
  if (!baseAssetMetadata?.penumbraAssetId || !quoteAssetMetadata?.penumbraAssetId) {
    return NextResponse.json(
      { error: `Base asset or quoteAsset asset ids not found in registry` },
      { status: 400 },
    );
  }

  // Need to query both directions and aggregate results
  const candles = await getCandles({
    baseAsset: baseAssetMetadata.penumbraAssetId,
    quoteAsset: quoteAssetMetadata.penumbraAssetId,
    window: durationWindow,
    chainId,
    limit,
    page,
  });

  const displayAdjusted = candles.map(c =>
    dbCandleToOhlc(c, baseAssetMetadata, quoteAssetMetadata),
  );
  const response = insertEmptyCandles(durationWindow, displayAdjusted);

  return NextResponse.json(response);
}
