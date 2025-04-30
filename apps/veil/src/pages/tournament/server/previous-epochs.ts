import { sql } from 'kysely';
import { NextRequest, NextResponse } from 'next/server';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { Gauge } from '@/shared/database/schema';
import { pindexerDb } from '@/shared/database/client';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

const SORT_KEYS = ['epoch', 'lpReward', 'votingReward', ''] as const;
export type PreviousEpochsSortKey = (typeof SORT_KEYS)[number];

const DIRECTIONS = ['asc', 'desc'] as const;
export type PreviousEpochsSortDirection = (typeof DIRECTIONS)[number];

export interface PreviousEpochsRequest {
  epoch?: number;
  limit: number;
  page: number;
  sortKey: PreviousEpochsSortKey;
  sortDirection: PreviousEpochsSortDirection;
}

export interface MappedGauge extends Omit<Gauge, 'asset_id' | 'missing_votes'> {
  asset: Metadata;
  missing_votes: number;
}

export interface PreviousEpochData {
  epoch: number;
  gauge: MappedGauge[];
}

export interface PreviousEpochsApiResponse {
  total: number;
  data: PreviousEpochData[];
}

const DEFAULT_LIMIT = 10;

export const getQueryParams = (req: NextRequest): PreviousEpochsRequest => {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const page = Number(searchParams.get('page')) || 1;
  const epoch = Number(searchParams.get('epoch')) || undefined;

  const sortKeyParam = searchParams.get('sortKey');
  const sortKey =
    sortKeyParam && SORT_KEYS.includes(sortKeyParam as PreviousEpochsSortKey)
      ? (sortKeyParam as PreviousEpochsSortKey)
      : 'epoch';

  const sortDirectionParam = searchParams.get('sortDirection');
  const sortDirection =
    sortDirectionParam && DIRECTIONS.includes(sortDirectionParam as PreviousEpochsSortDirection)
      ? (sortDirectionParam as PreviousEpochsSortDirection)
      : 'desc';

  return {
    epoch,
    limit,
    page,
    sortKey,
    sortDirection,
  };
};

const previousEpochsQuery = async ({
  limit,
  page,
  sortDirection,
  epoch,
}: PreviousEpochsRequest) => {
  // 1. Take the 'gauge' table and sort it by 'epoch' and then by 'portion', map asset_id to base64
  const sortedGauge = pindexerDb
    .selectFrom('lqt.gauge as gauge')
    .select(exp => [
      'gauge.epoch',
      'gauge.votes',
      'gauge.portion',
      'gauge.missing_votes',
      sql<string>`encode(${exp.ref('gauge.asset_id')}, 'base64')`.as('asset_id'),
    ])
    .orderBy('epoch', sortDirection)
    .orderBy('portion', 'desc')
    .limit(limit)
    .offset(limit * (page - 1));

  // 2. group by 'epoch' and aggregate the results into a JSON array
  return pindexerDb
    .selectFrom(sortedGauge.as('sorted_gauge'))
    .select([
      'epoch',
      sql<(Omit<Gauge, 'asset_id'> & { asset_id: string })[]>`json_agg(sorted_gauge.*)`.as('gauge'),
    ])
    .$if(!!epoch, qb => (epoch ? qb.where('epoch', '=', epoch) : qb))
    .orderBy('epoch', sortDirection)
    .groupBy('epoch')
    .execute();
};

const totalEpochsQuery = async () => {
  return pindexerDb
    .selectFrom('lqt.gauge')
    .select(exp => [exp.fn.countAll().as('total')])
    .executeTakeFirst();
};

export async function GET(
  req: NextRequest,
): Promise<NextResponse<Serialized<PreviousEpochsApiResponse | { error: string }>>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const params = getQueryParams(req);

  const registryClient = new ChainRegistryClient();

  const [registry, results, total] = await Promise.all([
    registryClient.remote.get(chainId),
    previousEpochsQuery(params),
    totalEpochsQuery(),
  ]);

  const mapped = results.map<PreviousEpochData>(result => ({
    epoch: result.epoch,
    gauge: result.gauge
      .map(item => {
        const asset = registry.tryGetMetadata(
          new AssetId({
            inner: base64ToUint8Array(item.asset_id),
          }),
        );

        if (!asset) {
          return undefined;
        }

        return {
          asset,
          epoch: item.epoch,
          votes: item.votes,
          portion: item.portion,
          missing_votes: Number(item.missing_votes),
        };
      })
      .filter(Boolean) as MappedGauge[],
  }));

  return NextResponse.json({
    total: Number(total?.total ?? 0),
    data: serialize(mapped),
  });
}
