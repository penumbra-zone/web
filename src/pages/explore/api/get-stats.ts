import { ValueView, AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { pindexer } from '@/shared/database';
import { DurationWindow } from '@/shared/utils/duration';
import { toValueView } from '@/shared/utils/value-view';

export interface StatsData {
  activePairs: number;
  trades: number;
  largestPair?: { start: string; end: string };
  topPriceMover?: { start: string; end: string; percent: number };
  directVolume: ValueView;
  liquidity: ValueView;
  largestPairLiquidity?: ValueView;
}

export type StatsResponse = StatsData | { error: string };

const STATS_DURATION_WINDOW: DurationWindow = '1d';

export const getStats = async (): Promise<StatsResponse> => {
  try {
    const chainId = process.env['PENUMBRA_CHAIN_ID'];
    if (!chainId) {
      return { error: 'PENUMBRA_CHAIN_ID is not set' };
    }

    const registryClient = new ChainRegistryClient();

    const [registry, results] = await Promise.all([
      registryClient.remote.get(chainId),
      pindexer.stats(STATS_DURATION_WINDOW),
    ]);

    const stats = results[0];
    if (!stats) {
      return { error: `No stats found` };
    }

    // TODO: Add getMetadataBySymbol() helper to registry npm package
    const allAssets = registry.getAllAssets();
    // TODO: what asset should be used here?
    const usdcMetadata = allAssets.find(asset => asset.symbol.toLowerCase() === 'usdc');
    if (!usdcMetadata) {
      return { error: 'USDC not found in registry' };
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

    return {
      activePairs: stats.active_pairs,
      trades: stats.trades,
      largestPair,
      topPriceMover,
      largestPairLiquidity:
        largestPairEnd &&
        toValueView({
          amount: stats.largest_dv_trading_pair_volume,
          metadata: largestPairEnd,
        }),
      liquidity: toValueView({
        amount: parseInt(`${stats.liquidity}`),
        metadata: usdcMetadata,
      }),
      directVolume: toValueView({ amount: stats.direct_volume, metadata: usdcMetadata }),
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
};
