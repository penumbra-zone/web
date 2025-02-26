import { Pool, types } from 'pg';
import fs from 'fs';
import { Kysely, PostgresDialect, Selectable, sql } from 'kysely';
import {
  DB,
  DexExAggregateSummary,
  DexExPositionExecutions,
  DexExPositionReserves,
  DexExPositionWithdrawals,
  DexExBlockSummary,
  DexExTransactions,
} from '@/shared/database/schema.ts';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DurationWindow } from '@/shared/utils/duration.ts';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { hexToUint8Array } from '@penumbra-zone/types/hex';

const MAINNET_CHAIN_ID = 'penumbra-1';

export interface ExecutionWithReserves {
  execution: Selectable<DexExPositionExecutions>;
  reserves: Selectable<DexExPositionReserves>;
}

export interface VolumeAndFees {
  volume1: string;
  volume2: string;
  fees1: string;
  fees2: string;
  context_asset_start: Buffer;
  context_asset_end: Buffer;
  executionCount: number;
}

class Pindexer {
  private db: Kysely<DB>;

  constructor() {
    const ca = process.env['PENUMBRA_INDEXER_CA_CERT'];
    const connectionString = process.env['PENUMBRA_INDEXER_ENDPOINT'];
    const dbConfig = {
      connectionString: connectionString,
      ...(ca && {
        ssl: {
          rejectUnauthorized: true,
          ca: ca.startsWith('-----BEGIN CERTIFICATE-----') ? ca : fs.readFileSync(ca, 'utf-8'),
        },
      }),
    };
    const dialect = new PostgresDialect({
      pool: new Pool(dbConfig),
    });

    this.db = new Kysely<DB>({ dialect });

    const int8TypeId = 20;
    // Map int8 to number.
    types.setTypeParser(int8TypeId, val => {
      return BigInt(val);
    });
  }

  async summary(window: DurationWindow, baseAsset: AssetId, quoteAsset: AssetId) {
    return this.db
      .selectFrom('dex_ex_pairs_summary')
      .selectAll()
      .where('the_window', '=', window)
      .where('asset_start', '=', Buffer.from(baseAsset.inner))
      .where('asset_end', '=', Buffer.from(quoteAsset.inner))
      .execute();
  }

  async stats(window: DurationWindow): Promise<DexExAggregateSummary[]> {
    return this.db
      .selectFrom('dex_ex_aggregate_summary as agg')
      .selectAll()
      .where('agg.the_window', '=', window)
      .execute();
  }

  async pairs({ usdc, stablecoins }: { usdc: AssetId; stablecoins: AssetId[] }) {
    const usdcTable = this.db
      .selectFrom('dex_ex_pairs_summary')
      .where('asset_end', '=', Buffer.from(usdc.inner))
      .where('the_window', '=', '1m')
      .groupBy(['asset_end', 'asset_start', 'the_window'])
      .selectAll();

    const joined = this.db
      .selectFrom('dex_ex_pairs_summary as outer')
      .selectAll('outer')
      // get the usdc price of the quote asset
      .leftJoin(usdcTable.as('usdc'), 'outer.asset_end', 'usdc.asset_start')
      .select(['usdc.price as usdc_price'])
      .where(exp =>
        exp.and([
          exp.eb('outer.the_window', '=', '1m'),
          exp.eb('outer.price', '!=', 0),
          // Filters out pairs where stablecoins are base assets (e.g. no USDC/UM, only UM/USDC)
          exp.eb(
            exp.ref('outer.asset_start'),
            'not in',
            stablecoins.map(asset => Buffer.from(asset.inner)),
          ),
        ]),
      )
      // sort desc by USDC equivalent of liquidity
      .orderBy(
        exp => sql`COALESCE(${exp.ref('usdc.price')}, 1) * ${exp.ref('outer.liquidity')} desc`,
      )
      .limit(15);

    return joined.execute();
  }

  async candles({
    baseAsset,
    quoteAsset,
    window,
    chainId,
  }: {
    baseAsset: AssetId;
    quoteAsset: AssetId;
    window: DurationWindow;
    chainId: string;
  }) {
    let query = this.db
      .selectFrom('dex_ex_price_charts')
      .select(['start_time', 'open', 'close', 'low', 'high', 'swap_volume', 'direct_volume'])
      .where('the_window', '=', window)
      .where('asset_start', '=', Buffer.from(baseAsset.inner))
      .where('asset_end', '=', Buffer.from(quoteAsset.inner))
      .orderBy('start_time', 'asc');

    // Due to a lot of price volatility at the launch of the chain, manually setting start date a few days later
    if (chainId === MAINNET_CHAIN_ID) {
      query = query.where('start_time', '>=', new Date('2024-08-06'));
    }

    return query.execute();
  }

  // Paginated pair summaries
  async summaries({
    window = '1d',
    candlesWindow = '1h',
    candlesInterval = '24 hours',
    limit,
    offset,
    stablecoins,
    usdc,
    searchAssets,
  }: {
    /** Window duration of information of the pairs */
    window: DurationWindow;
    /** Window duration of candles selected for each pair */
    candlesWindow?: DurationWindow;
    /** Select candles starting from `NOW - candlesInterval` time till now */
    candlesInterval?: `${number}${number} hours` | `${number} hour`;
    /** The list of AssetIDs to exclude from base assets (stable coins can only be quote assets) */
    stablecoins: AssetId[];
    /** An array of assetId to filter by */
    searchAssets?: AssetId[];
    limit: number;
    offset: number;
    usdc: AssetId;
  }) {
    const usdcTable = this.db
      .selectFrom('dex_ex_pairs_summary')
      .where('asset_end', '=', Buffer.from(usdc.inner))
      .where('the_window', '=', '1m')
      .groupBy(['asset_end', 'asset_start', 'the_window'])
      .selectAll();

    // Selects only distinct pairs (USDT/USDC, but not reverse) with its data
    let summaryTable = this.db
      .selectFrom('dex_ex_pairs_summary')
      // Filters out the reversed pairs (e.g. if found UM/OSMO, then there won't be OSMO/UM)
      .distinctOn(sql<string>`least(asset_start, asset_end), greatest(asset_start, asset_end)`)
      .selectAll()
      .where('the_window', '=', window)
      .where('price', '!=', 0)
      // Make sure pair bases are not stablecoins
      .where(
        'asset_start',
        'not in',
        stablecoins.map(asset => Buffer.from(asset.inner)),
      )
      .where(exp =>
        exp.or([exp.eb('liquidity', '!=', 0), exp.eb('direct_volume_over_window', '!=', 0)]),
      );

    // Filter the assets if searchAssets is provided
    if (typeof searchAssets !== 'undefined') {
      const buffers = searchAssets.map(asset => Buffer.from(asset.inner));
      summaryTable = summaryTable.where(exp =>
        exp.or([exp.eb('asset_start', 'in', buffers), exp.eb('asset_end', 'in', buffers)]),
      );
    }

    // Selects 1h-candles for the last 24 hours and aggregates them into a single array, ordering by assets
    const candlesTable = this.db
      .selectFrom('dex_ex_price_charts')
      .groupBy(() => ['asset_start', 'asset_end'])
      .select(exp => [
        'asset_end',
        'asset_start',
        // Produce arrays of candles and candle times per pair group
        sql<number[]>`array_agg(${exp.ref('close')} ORDER BY start_time ASC)`.as('candles'),
        sql<Date[]>`array_agg(${exp.ref('start_time')} ORDER BY start_time ASC)`.as('candle_times'),
      ])
      .where(exp =>
        exp.and([
          exp.eb('the_window', '=', candlesWindow),
          sql<boolean>`${exp.ref('start_time')} >= NOW() - CAST(${candlesInterval} AS INTERVAL)`,
        ]),
      );

    // Joins summaryTable with candlesTable to get pair info with the latest candles
    const joinedTable = this.db
      .selectFrom(summaryTable.as('summary'))
      .leftJoin(candlesTable.as('candles'), join =>
        join
          .onRef('candles.asset_start', '=', 'summary.asset_start')
          .onRef('candles.asset_end', '=', 'summary.asset_end'),
      )
      .leftJoin(usdcTable.as('usdc'), 'summary.asset_end', 'usdc.asset_start')
      .select([
        'summary.asset_start',
        'summary.asset_end',
        'summary.price',
        'summary.price_then',
        'summary.the_window',
        'summary.direct_volume_over_window',
        'summary.swap_volume_over_window',
        'summary.direct_volume_indexing_denom_over_window',
        'summary.swap_volume_indexing_denom_over_window',
        'summary.liquidity',
        'summary.liquidity_then',
        'summary.trades_over_window',
        'summary.low',
        'summary.high',
        'candles.candles',
        'candles.candle_times',
        'usdc.price as usdc_price',
      ])
      .orderBy('summary.direct_volume_indexing_denom_over_window', 'desc')
      .limit(limit)
      .offset(offset);

    return joinedTable.execute();
  }

  async getPositionState(positionId: PositionId) {
    const stateQuery = this.db
      .selectFrom('dex_ex_position_state as state')
      .innerJoin(
        'dex_ex_position_reserves as reserves',
        'state.opening_reserves_rowid',
        'reserves.rowid',
      )
      .selectAll('state')
      .selectAll('reserves')
      .where('state.position_id', '=', Buffer.from(positionId.inner))
      .executeTakeFirst();

    const reservesQuery = this.db
      .selectFrom('dex_ex_position_reserves')
      .selectAll()
      .where('position_id', '=', Buffer.from(positionId.inner))
      .orderBy('height', 'desc')
      .orderBy('rowid', 'desc')
      .limit(1)
      .executeTakeFirst();

    const [state, latestReserves] = await Promise.all([stateQuery, reservesQuery]);
    if (!state || !latestReserves) {
      return undefined;
    }

    return { state, latestReserves };
  }

  async getPositionExecutionsWithReserves(
    positionId: PositionId,
  ): Promise<{ items: ExecutionWithReserves[]; skippedRows: number }> {
    const maxCount = 100;

    // First, get the total count
    const totalCount = await this.db
      .selectFrom('dex_ex_position_executions')
      .select(sql`count(*)`.as('count'))
      .where('position_id', '=', Buffer.from(positionId.inner))
      .executeTakeFirstOrThrow();

    // Then get the actual items
    const results = await this.db
      .selectFrom('dex_ex_position_executions as executions')
      .innerJoin(
        'dex_ex_position_reserves as reserves',
        'executions.reserves_rowid',
        'reserves.rowid',
      )
      .selectAll('executions')
      .selectAll('reserves')
      .where('executions.position_id', '=', Buffer.from(positionId.inner))
      .orderBy('executions.height', 'desc')
      .orderBy('executions.rowid', 'desc')
      .limit(maxCount)
      .execute();

    const items = results.map(row => ({
      execution: {
        context_asset_end: row.context_asset_end,
        context_asset_start: row.context_asset_start,
        delta_1: row.delta_1,
        delta_2: row.delta_2,
        fee_1: row.fee_1,
        fee_2: row.fee_2,
        height: row.height,
        lambda_1: row.lambda_1,
        lambda_2: row.lambda_2,
        position_id: row.position_id,
        reserves_rowid: row.reserves_rowid,
        rowid: row.rowid,
        time: row.time,
      },
      reserves: {
        height: row.height,
        position_id: row.position_id,
        reserves_1: row.reserves_1,
        reserves_2: row.reserves_2,
        rowid: row.reserves_rowid,
        time: row.time,
      },
    }));

    return {
      items,
      skippedRows: Math.max(0, Number(totalCount.count) - maxCount),
    };
  }

  async getPositionWithdrawals(
    positionId: PositionId,
  ): Promise<Selectable<DexExPositionWithdrawals>[]> {
    return this.db
      .selectFrom('dex_ex_position_withdrawals')
      .selectAll()
      .where('position_id', '=', Buffer.from(positionId.inner))
      .orderBy('height', 'desc')
      .orderBy('rowid', 'desc')
      .execute();
  }

  async recentExecutions(base: AssetId, quote: AssetId, amount: number) {
    return await this.db
      .selectFrom('dex_ex_batch_swap_traces')
      .select([
        'amount_hops',
        'asset_end',
        'asset_hops',
        'asset_start',
        'batch_input',
        'batch_output',
        'height',
        'input',
        'output',
        'position_id_hops',
        'price_float',
        'rowid',
        'time',
      ])
      .where('asset_start', '=', Buffer.from(base.inner))
      .where('asset_end', '=', Buffer.from(quote.inner))
      .orderBy('time', 'desc')
      .orderBy('rowid', 'asc') // Secondary sort by ID to maintain order within the same time frame
      .limit(amount)
      .execute();
  }

  async myTrades(
    data: { base: AssetId; quote: AssetId; height: number; input: number; output: number }[],
  ) {
    // prepare data for insertion by encoding AssetId to base64 and assigning correct input amount based on direction
    const sell = data.map(swap => ({
      type: 'sell',
      height: swap.height,
      amount: swap.output,
      quote: Buffer.from(swap.base.inner).toString('base64'),
      base: Buffer.from(swap.quote.inner).toString('base64'),
    }));
    const buy = data.map(swap => ({
      type: 'buy',
      height: swap.height,
      amount: swap.input,
      quote: Buffer.from(swap.quote.inner).toString('base64'),
      base: Buffer.from(swap.base.inner).toString('base64'),
    }));

    // stringify values to insert into a virtual table
    const swapsJson = JSON.stringify(buy.concat(sell));

    // create virtual table from JSON, decode buffers again from base64 strings
    const latestSwaps = this.db.with('latest_swaps', db =>
      db
        .selectFrom(
          sql<{
            type: 'buy' | 'sell';
            base: string;
            quote: string;
            height: number;
            amount: number;
          }>`jsonb_to_recordset(${sql.lit(swapsJson)}::jsonb)`.as<'latest_swaps'>(
            sql`latest_swaps(base TEXT, quote TEXT, height INT, amount INT, type TEXT)`,
          ),
        )
        .select(exp => [
          'type',
          'height',
          'amount',
          sql<Buffer>`decode(${exp.ref('latest_swaps.base')}, 'base64')::bytea`.as('base'),
          sql<Buffer>`decode(${exp.ref('latest_swaps.quote')}, 'base64')::bytea`.as('quote'),
        ]),
    );

    // join virtual table with latest swaps
    return latestSwaps
      .selectFrom('dex_ex_batch_swap_traces as swaps')
      .innerJoin('latest_swaps', join =>
        join
          .onRef('swaps.asset_start', '=', 'latest_swaps.base')
          .onRef('swaps.asset_end', '=', 'latest_swaps.quote')
          .onRef('swaps.height', '=', 'latest_swaps.height')
          .onRef('swaps.batch_input', '=', 'latest_swaps.amount'),
      )
      .selectAll()
      .orderBy('time', 'desc')
      .limit(10)
      .execute();
  }

  async getPositionVolumeAndFees(positionId: PositionId): Promise<VolumeAndFees[]> {
    const results = await this.db
      .selectFrom('dex_ex_position_executions')
      .select([
        'context_asset_start',
        'context_asset_end',
        sql<string>`sum(delta_1 + lambda_1)`.as('volume1'),
        sql<string>`sum(delta_2 + lambda_2)`.as('volume2'),
        sql<string>`sum(fee_1)`.as('fees1'),
        sql<string>`sum(fee_2)`.as('fees2'),
        sql<number>`CAST(count(*) AS INTEGER)`.as('executionCount'),
      ])
      .where('position_id', '=', Buffer.from(positionId.inner))
      .groupBy(['context_asset_start', 'context_asset_end'])
      .orderBy('executionCount', 'desc')
      .execute();

    return results.map(row => ({
      ...row,
      volume1: row.volume1,
      volume2: row.volume2,
      fees1: row.fees1,
      fees2: row.fees2,
      executionCount: row.executionCount,
    }));
  }

  async getBlockSummary(height: number): Promise<Selectable<DexExBlockSummary> | undefined> {
    return this.db
      .selectFrom('dex_ex_block_summary')
      .selectAll()
      .where('height', '=', height)
      .executeTakeFirst();
  }

  async getTransaction(txHash: string): Promise<Selectable<DexExTransactions> | undefined> {
    return this.db
      .selectFrom('dex_ex_transactions')
      .selectAll()
      .where('transaction_id', '=', Buffer.from(hexToUint8Array(txHash)))
      .executeTakeFirst();
  }
}

export const pindexer = new Pindexer();
