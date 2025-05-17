import { sql } from 'kysely';
import { NextRequest, NextResponse } from 'next/server';
import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { MappedGauge } from './previous-epochs';

const SORT_KEYS = ['portion', 'votes'] as const;
export type EpochResultsSortKey = (typeof SORT_KEYS)[number];

const DIRECTIONS = ['asc', 'desc'] as const;
export type EpochResultsSortDirection = (typeof DIRECTIONS)[number];

export interface EpochResultsRequest {
  epoch: number;
  limit: number;
  page: number;
  sortKey: EpochResultsSortKey;
  sortDirection: EpochResultsSortDirection;
}

export interface EpochResultsApiResponse {
  total: number;
  data: MappedGauge[];
}

const DEFAULT_LIMIT = 10;

export const getQueryParams = (req: NextRequest): EpochResultsRequest => {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const page = Number(searchParams.get('page')) || 1;
  const epoch = Number(searchParams.get('epoch'));

  const sortKeyParam = searchParams.get('sortKey');
  const sortKey =
    sortKeyParam && SORT_KEYS.includes(sortKeyParam as EpochResultsSortKey)
      ? (sortKeyParam as EpochResultsSortKey)
      : 'portion';

  const sortDirectionParam = searchParams.get('sortDirection');
  const sortDirection =
    sortDirectionParam && DIRECTIONS.includes(sortDirectionParam as EpochResultsSortDirection)
      ? (sortDirectionParam as EpochResultsSortDirection)
      : 'desc';

  return {
    epoch,
    limit,
    page,
    sortKey,
    sortDirection,
  };
};

const epochResultsQuery = async ({
  limit,
  page,
  sortKey,
  sortDirection,
  epoch,
}: EpochResultsRequest) => {
  return pindexerDb
    .selectFrom('lqt.gauge as gauge')
    .select(exp => [
      'epoch',
      'votes',
      'portion',
      sql<string>`encode(${exp.ref('asset_id')}, 'base64')`.as('asset_id'),
    ])
    .where('epoch', '=', epoch)
    .orderBy(sortKey, sortDirection)
    .limit(limit)
    .offset(limit * (page - 1))
    .execute();
};

const totalEpochResultsQuery = async ({ epoch }: EpochResultsRequest) => {
  return pindexerDb
    .selectFrom('lqt.gauge')
    .select(exp => [exp.fn.countAll().as('total')])
    .where('epoch', '=', epoch)
    .executeTakeFirst();
};

// Cache time-to-live for registry data (milliseconds)
const REGISTRY_CACHE_TTL_MS = 5 * 60 * 1000;
// In-memory cache for registry data per chainId
const registryCache = new Map<string, { registry: Registry; expiresAt: number }>();

// Helper to get cached registry data
async function getCachedRegistry(chainId: string): Promise<Registry> {
  const entry = registryCache.get(chainId);
  const now = Date.now();
  if (entry && entry.expiresAt > now) {
    return entry.registry;
  }
  const client = new ChainRegistryClient();
  try {
    const registry = await client.remote.get(chainId);
    registryCache.set(chainId, { registry, expiresAt: now + REGISTRY_CACHE_TTL_MS });
    return registry;
  } catch (err: unknown) {
    registryCache.delete(chainId);
    throw err;
  }
}

export async function GET(
  req: NextRequest,
): Promise<NextResponse<Serialized<EpochResultsApiResponse | { error: string }>>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const params = getQueryParams(req);

  if (!params.epoch || params.epoch < 0) {
    return NextResponse.json({ error: 'Required query parameter: "epoch"' }, { status: 400 });
  }

  const [registry, results, total] = await Promise.all([
    getCachedRegistry(chainId),
    epochResultsQuery(params),
    totalEpochResultsQuery(params),
  ]);

  const mapped = results
    .map<MappedGauge | undefined>(item => {
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
      };
    })
    .filter((item): item is MappedGauge => !!item);

  return NextResponse.json({
    total: Number(total?.total ?? 0),
    data: serialize(mapped),
  });
}
