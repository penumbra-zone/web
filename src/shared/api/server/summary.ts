import { NextRequest, NextResponse } from 'next/server';
import { pindexer } from '@/shared/database';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { durationWindows, isDurationWindow } from '@/shared/utils/duration.ts';
import { ChangeData, SummaryDataResponse, SummaryResponse } from '@/shared/api/server/types.ts';
import { round } from '@penumbra-zone/types/round';
import { toValueView } from '@/shared/utils/value-view.ts';
import { calculateDisplayPrice } from '@/shared/utils/price-conversion.ts';

export async function GET(req: NextRequest): Promise<NextResponse<SummaryResponse>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const baseAssetSymbol = searchParams.get('baseAsset');
  const quoteAssetSymbol = searchParams.get('quoteAsset');
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
      { error: `Base asset or quoteAsset assetId not found in registry` },
      { status: 400 },
    );
  }

  const results = await pindexer.summary(
    durationWindow,
    baseAssetMetadata.penumbraAssetId,
    quoteAssetMetadata.penumbraAssetId,
  );

  const summary = results[0];
  if (!summary) {
    return NextResponse.json({ window: durationWindow, noData: true });
  }

  const priceDiff = summary.price - summary.price_then;
  const change = {
    value: calculateDisplayPrice(priceDiff, baseAssetMetadata, quoteAssetMetadata),
    sign: priceDiffLabel(priceDiff),
    percent:
      summary.price === 0
        ? '0'
        : round({
            value: Math.abs(((summary.price - summary.price_then) / summary.price_then) * 100),
            decimals: 2,
          }),
  };

  const dataResponse = new SummaryDataResponse({
    window: durationWindow,
    directVolume: toValueView({
      amount: summary.direct_volume_over_window,
      metadata: quoteAssetMetadata,
    }),
    price: calculateDisplayPrice(summary.price, baseAssetMetadata, quoteAssetMetadata),
    low: calculateDisplayPrice(summary.low, baseAssetMetadata, quoteAssetMetadata),
    high: calculateDisplayPrice(summary.high, baseAssetMetadata, quoteAssetMetadata),
    change,
  });

  return NextResponse.json(dataResponse.toJson());
}

const priceDiffLabel = (num: number): ChangeData['sign'] => {
  if (num === 0) {
    return 'neutral';
  }
  if (num > 0) {
    return 'positive';
  }
  return 'negative';
};
