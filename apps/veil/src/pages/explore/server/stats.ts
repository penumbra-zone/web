// The code in this file will run on the server.
'use server';
import { pindexerDb } from '@/shared/database/client';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DirectedTradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { pnum } from '@penumbra-zone/types/pnum';

/** Statistics about aggregate activity on the dex, across all pairs.
 *
 * These statistics are all calculated over a fixed window of duration.
 *
 * Metrics of type "Value" are all going to be under the same asset, that
 * used to provide a common denominator across different pairs.
 * This is something like "USDC", but it may be different on the testnet,
 * and may change, so resulting code should not assume it's a particular
 * value, and instead handle it generically.
 */
export interface Stats {
  indexingAsset: AssetId;
  /** The total volume traded, across all assets, under a common denominator. */
  totalTradingVolume: Amount;
  /** The total liquidity available on the dex. */
  totalLiquidity: Amount;
  /** The number of trades that have happened.*/
  trades: number;
  /** The number of pairs where trading has happened. */
  activePairs: number;
  /** The pair with the most volume associated with it. */
  largestTradingPairByVolume: { pair: DirectedTradingPair; volume: Amount };
  /** The pair with the largest move in price. */
  topPriceMover: { pair: DirectedTradingPair; changePercent: number };
}

async function indexingAsset(): Promise<AssetId> {
  const { quote_asset_id } = await pindexerDb
    .selectFrom('dex_ex_metadata')
    .select('quote_asset_id')
    .executeTakeFirstOrThrow();
  return new AssetId({ inner: quote_asset_id });
}

export async function fetchStats(): Promise<Serialized<Stats>> {
  // Kick off the fetching of the indexing asset.
  const indexingAssetP = indexingAsset();
  const raw = await pindexerDb
    .selectFrom('dex_ex_aggregate_summary')
    .select([
      'direct_volume',
      'liquidity',
      'trades',
      'active_pairs',
      'largest_dv_trading_pair_start',
      'largest_dv_trading_pair_end',
      'largest_dv_trading_pair_volume',
      'top_price_mover_start',
      'top_price_mover_end',
      'top_price_mover_change_percent',
    ])
    .where('the_window', '=', '1d')
    .executeTakeFirstOrThrow();
  const theIndexingAsset = await indexingAssetP;
  return serialize({
    indexingAsset: theIndexingAsset,
    totalTradingVolume: pnum(raw.direct_volume).toAmount(),
    totalLiquidity: pnum(raw.liquidity).toAmount(),
    trades: raw.trades,
    activePairs: raw.active_pairs,
    largestTradingPairByVolume: {
      pair: new DirectedTradingPair({
        start: new AssetId({ inner: raw.largest_dv_trading_pair_start }),
        end: new AssetId({ inner: raw.largest_dv_trading_pair_end }),
      }),
      volume: pnum(raw.largest_dv_trading_pair_volume).toAmount(),
    },
    topPriceMover: {
      pair: new DirectedTradingPair({
        start: new AssetId({ inner: raw.top_price_mover_start }),
        end: new AssetId({ inner: raw.top_price_mover_end }),
      }),
      changePercent: raw.top_price_mover_change_percent,
    },
  });
}
