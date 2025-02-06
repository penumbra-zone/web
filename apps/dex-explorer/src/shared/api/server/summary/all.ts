import { NextRequest, NextResponse } from 'next/server';
import { pindexer } from '@/shared/database';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { DurationWindow, durationWindows, isDurationWindow } from '@/shared/utils/duration.ts';
import { adaptSummary, SummaryData } from '@/shared/api/server/summary/types.ts';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { getStablecoins } from '@/shared/utils/stables';

interface GetPairsParams {
  window: DurationWindow | null;
  limit: number;
  offset: number;
  search: string;
}

const getURLParams = (url: string): GetPairsParams => {
  const { searchParams } = new URL(url);
  const limit = Number(searchParams.get('limit')) || 15;
  const offset = Number(searchParams.get('offset')) || 0;
  const search = searchParams.get('search') ?? '';
  const window = searchParams.get('durationWindow');
  return {
    limit,
    offset,
    search,
    window: window as DurationWindow | null,
  };
};

const getAssetById = (allAssets: Metadata[], id: Buffer): Metadata | undefined => {
  return allAssets.find(asset => {
    return asset.penumbraAssetId?.equals(new AssetId({ inner: id }));
  });
};

export type SummariesResponse = Serialized<SummaryData>[] | { error: string };

export const GET = async (req: NextRequest): Promise<NextResponse<SummariesResponse>> => {
  try {
    const chainId = process.env['PENUMBRA_CHAIN_ID'];
    if (!chainId) {
      return NextResponse.json({ error: 'Error: PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
    }

    const registryClient = new ChainRegistryClient();
    const registry = await registryClient.remote.get(chainId);
    const allAssets = registry.getAllAssets();

    const { stablecoins, usdc } = getStablecoins(allAssets, 'USDC');
    if (!usdc) {
      return NextResponse.json({ error: 'Error: USDC asset does not exist' }, { status: 500 });
    }

    const { window, search, limit, offset } = getURLParams(req.url);
    if (!window || !isDurationWindow(window)) {
      return NextResponse.json(
        {
          error: `durationWindow missing or invalid window. Options: ${durationWindows.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // If 'search' param is provided, find AssetIds with names matching the string
    const searchAssets = !search
      ? undefined
      : (allAssets
          .filter(
            asset =>
              asset.penumbraAssetId &&
              (asset.name.toLowerCase().includes(search.toLowerCase()) ||
                asset.symbol.toLowerCase().includes(search.toLowerCase())),
          )
          .map(asset => asset.penumbraAssetId) as AssetId[]);
    if (searchAssets?.length === 0) {
      return NextResponse.json([]);
    }

    const results = await pindexer.summaries({
      window,
      limit,
      offset,
      searchAssets,
      stablecoins: stablecoins.map(asset => asset.penumbraAssetId) as AssetId[],
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style -- usdc is defined
      usdc: usdc.penumbraAssetId as AssetId,
    });

    const summaries = await Promise.all(
      results.map(summary => {
        const baseAsset = getAssetById(allAssets, summary.asset_start);
        const quoteAsset = getAssetById(allAssets, summary.asset_end);
        if (!baseAsset || !quoteAsset) {
          return undefined;
        }

        return adaptSummary(
          summary,
          baseAsset,
          quoteAsset,
          usdc,
          summary.candles ?? [],
          summary.candle_times ?? [],
        );
      }),
    );

    return NextResponse.json(
      summaries.filter(Boolean).map(data => serialize(data)) as Serialized<SummaryData>[],
    );
  } catch (error) {
    return NextResponse.json({ error: `Error: ${(error as Error).message}` }, { status: 500 });
  }
};
