import { NextResponse } from 'next/server';
import { ValueView, AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { pindexer } from '@/shared/database';
import { DurationWindow } from '@/shared/utils/duration';
import { toValueView } from '@/shared/utils/value-view';
import { Serialized, serialize } from '@/shared/utils/serializer';
import { getClientSideEnv } from '../env/getClientSideEnv';
import { DirectedTradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { getStablecoins } from '@/shared/utils/stables';

export interface StatsData {
  activePairs: number;
  trades: number;
  largestPair: { pair: DirectedTradingPair; volume: ValueView };
  topPriceMover: { pair: DirectedTradingPair; percent: number };
  volume: ValueView;
  liquidity: ValueView;
  largestPairLiquidity?: ValueView;
}

export type StatsResponse = StatsData | { error: string };

const STATS_DURATION_WINDOW: DurationWindow = '1d';

export const getStats = async (): Promise<Serialized<StatsResponse>> => {
  try {
    const chainId = getClientSideEnv().PENUMBRA_CHAIN_ID;
    const registryClient = new ChainRegistryClient();
    const registry = await registryClient.remote.get(chainId);
    const usdcMetadata = getStablecoins(registry.getAllAssets(), 'USDC').usdc;
    if (!usdcMetadata) {
      return { error: 'USDC not found in registry' };
    }

    const results = await pindexer.stats(STATS_DURATION_WINDOW);
    const stats = results[0];
    if (!stats) {
      return { error: `No stats found` };
    }
    return serialize({
      activePairs: stats.active_pairs,
      trades: stats.trades,
      largestPair: {
        pair: new DirectedTradingPair({
          start: new AssetId({ inner: stats.largest_dv_trading_pair_start }),
          end: new AssetId({ inner: stats.largest_dv_trading_pair_end }),
        }),
        volume: toValueView({
          amount: Math.floor(stats.largest_dv_trading_pair_volume),
          metadata: usdcMetadata,
        }),
      },
      topPriceMover: {
        pair: new DirectedTradingPair({
          start: new AssetId({ inner: stats.top_price_mover_start }),
          end: new AssetId({ inner: stats.top_price_mover_end }),
        }),
        percent: stats.top_price_mover_change_percent,
      },
      volume: toValueView({ amount: Math.floor(stats.direct_volume), metadata: usdcMetadata }),
      liquidity: toValueView({ amount: Math.floor(stats.liquidity), metadata: usdcMetadata }),
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
