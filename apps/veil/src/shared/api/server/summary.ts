'use server';

import { pindexerDb } from '@/shared/database/client';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { sql } from 'kysely';
import { indexingAsset } from './indexing-asset';
import { pnum } from '@penumbra-zone/types/pnum';
import { deserialize, serialize, Serialized } from '@/shared/utils/serializer';
import { fetchRegistry } from '../fetch-registry';
import { getClientSideEnv } from '../env/getClientSideEnv';
import { Registry } from '@penumbra-labs/registry';
import { compareAssetId } from '@/shared/math/position';
import { DurationWindow } from '@/shared/utils/duration';

export interface Summary {
  price: number;
  high: number;
  low: number;
  liquidity: Value;
  volume: Value;
  priceDelta: number;
  priceChangePercent: number;
}

export interface SummaryWithPrices extends Summary {
  start: AssetId;
  end: AssetId;
  recentPrices: [Date, number][];
}

const PRIORITIES: Record<string, number> = {
  USDC: 2,
  USDY: 1,
  UM: 0,
};

function priority(registry: Registry, asset: AssetId): number | undefined {
  const meta = registry.tryGetMetadata(asset);
  if (!meta) {
    return undefined;
  }
  return PRIORITIES[meta.symbol] ?? -1;
}

function orderedCorrectly(registry: Registry, start: AssetId, end: AssetId): boolean {
  const startPriority = priority(registry, start);
  const endPriority = priority(registry, end);
  if (startPriority === undefined || endPriority === undefined) {
    return false;
  }
  if (endPriority > startPriority) {
    return true;
  }
  if (endPriority < 0 && startPriority < 0 && compareAssetId(start, end) > 0) {
    return true;
  }
  return false;
}

function basicQuery(window: DurationWindow) {
  return pindexerDb
    .with('summary', db =>
      db.selectFrom('dex_ex_pairs_summary').selectAll().where('the_window', '=', window),
    )
    .with('prices', db =>
      db
        .selectFrom('summary')
        .select(['asset_start', 'price'])
        .where('asset_end', '=', db.selectFrom('dex_ex_metadata').select('quote_asset_id')),
    )
    .with('metrics', db =>
      db
        .selectFrom('summary as d')
        .select([
          eb => eb.fn('least', ['d.asset_start', 'd.asset_end']).as('asset_start'),
          eb => eb.fn('greatest', ['d.asset_start', 'd.asset_end']).as('asset_end'),
        ])
        .select(sql<number>`SUM(liquidity * prices.price)`.as('liquidity'))
        .select(qb => qb.fn.max('direct_volume_indexing_denom_over_window').as('volume'))
        .leftJoin('prices', join =>
          join.on(eb => eb('d.asset_end', '=', eb.ref('prices.asset_start'))),
        )
        .groupBy(eb => eb.fn('least', ['d.asset_start', 'd.asset_end']))
        .groupBy(eb => eb.fn('greatest', ['d.asset_start', 'd.asset_end'])),
    )
    .with('recent_prices', db =>
      db
        .selectFrom('summary as d')
        .leftJoinLateral(
          eb =>
            eb
              .selectFrom('dex_ex_price_charts')
              .select(['start_time', 'close'])
              .where('dex_ex_price_charts.asset_start', '=', eb.ref('d.asset_start'))
              .where('dex_ex_price_charts.asset_end', '=', eb.ref('d.asset_end'))
              .orderBy('start_time', 'desc')
              .limit(24)
              .as('p'),
          join => join.onTrue(),
        )
        .select([
          'd.asset_start',
          'd.asset_end',
          eb =>
            eb.fn
              .coalesce(sql<number[]>`ARRAY_AGG(p.close)`, eb.val<number[]>([]))
              .as('recent_prices'),
          eb =>
            eb.fn
              .coalesce(sql<Date[]>`ARRAY_AGG(p.start_time)`, eb.val<number[]>([]))
              .as('recent_dates'),
        ])
        .groupBy(['d.asset_start', 'd.asset_end']),
    )
    .selectFrom('summary as d')
    .leftJoin('recent_prices as r', join =>
      join
        .on(eb => eb('d.asset_start', '=', eb.ref('r.asset_start')))
        .on(eb => eb('d.asset_end', '=', eb.ref('r.asset_end'))),
    )
    .leftJoin('metrics as m', join =>
      join.on(
        sql`m.asset_start = LEAST(d.asset_start, d.asset_end) AND m.asset_end = GREATEST(d.asset_start, d.asset_end)`,
      ),
    )
    .select([
      'd.asset_start',
      'd.asset_end',
      'm.liquidity',
      'm.volume',
      'recent_prices',
      'recent_dates',
      'd.price',
      'd.price_then',
      'd.high',
      'd.low',
    ]);
}

export async function fetchSummary(
  startAsset: Serialized<AssetId>,
  endAsset: Serialized<AssetId>,
  theWindow: DurationWindow,
): Promise<Serialized<Summary>> {
  const start = deserialize<AssetId>(startAsset);
  const end = deserialize<AssetId>(endAsset);
  const indexingAssetP = indexingAsset();
  const data = await basicQuery(theWindow)
    .where('d.asset_start', '=', Buffer.from(start.inner))
    .where('d.asset_end', '=', Buffer.from(end.inner))
    .executeTakeFirstOrThrow();
  const theIndexingAsset = await indexingAssetP;
  return serialize({
    liquidity: new Value({
      amount: pnum(data.liquidity ?? 0.0).toAmount(),
      assetId: theIndexingAsset,
    }),
    volume: new Value({ amount: pnum(data.volume ?? 0.0).toAmount(), assetId: theIndexingAsset }),
    price: data.price,
    priceDelta: data.price - data.price_then,
    priceChangePercent: 100 * (data.price / data.price_then - 1.0),
    high: data.high,
    low: data.low,
  });
}

/** Fetch summaries for all pairs over the past day. */
export async function fetchDaySummaries(): Promise<Serialized<SummaryWithPrices[]>> {
  // Kick off the fetching of the indexing asset.
  const indexingAssetP = indexingAsset();
  const registryP = fetchRegistry(getClientSideEnv().PENUMBRA_CHAIN_ID);
  const data = await basicQuery('1d')
    .orderBy('liquidity', 'desc')
    .orderBy('volume', 'desc')
    .execute();
  const theIndexingAsset = await indexingAssetP;
  const registry = await registryP;
  return serialize(
    data
      .map(x => ({
        start: new AssetId({ inner: x.asset_start }),
        end: new AssetId({ inner: x.asset_end }),
        liquidity: new Value({
          amount: pnum(x.liquidity ?? 0.0).toAmount(),
          assetId: theIndexingAsset,
        }),
        volume: new Value({ amount: pnum(x.volume ?? 0.0).toAmount(), assetId: theIndexingAsset }),
        price: x.price,
        priceChangePercent: 100 * (x.price / x.price_then - 1.0),
        priceDelta: x.price - x.price_then,
        recentPrices: (x.recent_prices ?? []).flatMap((p, i) => {
          const startTime = (x.recent_dates ?? [])[i];
          if (!startTime) {
            return [];
          }
          return [[startTime, p] as [Date, number]];
        }),
        high: x.high,
        low: x.low,
      }))
      .filter(x => orderedCorrectly(registry, x.start, x.end)),
  );
}
