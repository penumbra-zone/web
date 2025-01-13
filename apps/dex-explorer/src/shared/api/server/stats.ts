import { NextResponse } from 'next/server';
import { ValueView, AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { pindexer } from '@/shared/database';
import { DurationWindow } from '@/shared/utils/duration';
import { toValueView } from '@/shared/utils/value-view';
import { Serialized, serialize } from '@/shared/utils/serializer';
import { calculateEquivalentInUSDC } from '@/shared/utils/price-conversion';

interface StatsDataBase {
  activePairs: number;
  trades: number;
  largestPair?: { start: string; end: string };
  topPriceMover?: { start: string; end: string; percent: number };
}

export interface StatsData extends StatsDataBase {
  directVolume: ValueView;
  liquidity: ValueView;
  largestPairLiquidity?: ValueView;
}

export type StatsResponse = StatsData | { error: string };

const STATS_DURATION_WINDOW: DurationWindow = '1d';

export const getStats = async (): Promise<Serialized<StatsResponse>> => {
  try {
    const chainId = process.env['PENUMBRA_CHAIN_ID'];
    if (!chainId) {
      return { error: 'PENUMBRA_CHAIN_ID is not set' };
    }

    const registryClient = new ChainRegistryClient();
    const registry = await registryClient.remote.get(chainId);

    // TODO: Add getMetadataBySymbol() helper to registry npm package
    const allAssets = registry.getAllAssets();
    const usdcMetadata = allAssets.find(asset => asset.symbol.toLowerCase() === 'usdc');
    if (!usdcMetadata) {
      return { error: 'USDC not found in registry' };
    }

    const results = await pindexer.stats(
      STATS_DURATION_WINDOW,
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style -- usdc is defined
      usdcMetadata.penumbraAssetId as AssetId,
    );

    const stats = results[0];
    if (!stats) {
      return { error: `No stats found` };
    }

    const topPriceMoverStart = allAssets.find(asset => {
      return asset.penumbraAssetId?.equals(new AssetId({ inner: stats.top_price_mover_start }));
    });
    const topPriceMoverEnd = allAssets.find(asset => {
      return asset.penumbraAssetId?.equals(new AssetId({ inner: stats.top_price_mover_end }));
    });
    const topPriceMover = topPriceMoverStart &&
      topPriceMoverEnd && {
        start: topPriceMoverStart.symbol,
        end: topPriceMoverEnd.symbol,
        percent: stats.top_price_mover_change_percent,
      };

    const largestPairStart = allAssets.find(asset => {
      return asset.penumbraAssetId?.equals(
        new AssetId({ inner: stats.largest_dv_trading_pair_start }),
      );
    });
    const largestPairEnd = allAssets.find(asset => {
      return asset.penumbraAssetId?.equals(
        new AssetId({ inner: stats.largest_dv_trading_pair_end }),
      );
    });
    const largestPair = largestPairStart &&
      largestPairEnd && {
        start: largestPairStart.symbol,
        end: largestPairEnd.symbol,
      };

    let liquidity = toValueView({
      amount: Math.floor(stats.liquidity),
      metadata: usdcMetadata,
    });

    let directVolume = toValueView({
      amount: Math.floor(stats.direct_volume),
      metadata: usdcMetadata,
    });

    let largestPairLiquidity =
      largestPairEnd &&
      toValueView({
        amount: Math.floor(stats.largest_dv_trading_pair_volume),
        metadata: largestPairEnd,
      });

    // Converts liquidity and trading volume to their equivalent USDC prices if `usdc_price` is available
    if (stats.usdc_price && largestPairEnd) {
      liquidity = calculateEquivalentInUSDC(
        stats.liquidity,
        stats.usdc_price,
        largestPairEnd,
        usdcMetadata,
      );

      directVolume = calculateEquivalentInUSDC(
        stats.direct_volume,
        stats.usdc_price,
        largestPairEnd,
        usdcMetadata,
      );

      largestPairLiquidity = calculateEquivalentInUSDC(
        stats.largest_dv_trading_pair_volume,
        stats.usdc_price,
        largestPairEnd,
        usdcMetadata,
      );
    }

    return serialize({
      activePairs: stats.active_pairs,
      trades: stats.trades,
      largestPair,
      topPriceMover,
      time: new Date(),
      largestPairLiquidity,
      liquidity,
      directVolume,
    });
  } catch (error) {
    return { error: (error as Error).message };
  }
};

export const GET = async (): Promise<NextResponse<Serialized<StatsResponse>>> => {
  const result = await getStats();

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
};
