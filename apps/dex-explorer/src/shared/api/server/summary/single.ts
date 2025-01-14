import { NextRequest, NextResponse } from 'next/server';
import { pindexer } from '@/shared/database';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { durationWindows, isDurationWindow } from '@/shared/utils/duration.ts';
import { adaptSummary, SummaryResponse } from '@/shared/api/server/summary/types.ts';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { getStablecoins } from '@/shared/utils/stables';

export async function GET(req: NextRequest): Promise<NextResponse<Serialized<SummaryResponse>>> {
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

  const { usdc } = getStablecoins(allAssets, 'USDC');

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

  const adapted = adaptSummary(summary, baseAssetMetadata, quoteAssetMetadata, usdc);
  return NextResponse.json(serialize(adapted));
}
