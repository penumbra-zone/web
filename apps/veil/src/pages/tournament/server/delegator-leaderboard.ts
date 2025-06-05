import { NextRequest, NextResponse } from 'next/server';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { LqtDelegatorSummary } from '@/shared/database/schema';
import { pindexerDb } from '@/shared/database/client';

const SORT_KEYS = ['epochs_voted_in', 'streak', 'total_rewards'] as const;
export type DelegatorLeaderboardSortKey = (typeof SORT_KEYS)[number];

const DIRECTIONS = ['asc', 'desc'] as const;
export type DelegatorLeaderboardSortDirection = (typeof DIRECTIONS)[number];

export interface DelegatorLeaderboardRequest {
  limit: number;
  page: number;
  sortKey: DelegatorLeaderboardSortKey;
  sortDirection: DelegatorLeaderboardSortDirection;
}

export interface DelegatorLeaderboardData
  extends Omit<LqtDelegatorSummary, 'address' | 'epochs_voted_in'> {
  epochs_voted_in: number;
  address: Address;
}

export interface DelegatorLeaderboardApiResponse {
  total: number;
  data: DelegatorLeaderboardData[];
}

const DEFAULT_LIMIT = 10;

export const getQueryParams = (req: NextRequest): DelegatorLeaderboardRequest => {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const page = Number(searchParams.get('page')) || 1;

  const sortKeyParam = searchParams.get('sortKey');
  const sortKey =
    sortKeyParam && SORT_KEYS.includes(sortKeyParam as DelegatorLeaderboardSortKey)
      ? (sortKeyParam as DelegatorLeaderboardSortKey)
      : 'streak';

  const sortDirectionParam = searchParams.get('sortDirection');
  const sortDirection =
    sortDirectionParam &&
    DIRECTIONS.includes(sortDirectionParam as DelegatorLeaderboardSortDirection)
      ? (sortDirectionParam as DelegatorLeaderboardSortDirection)
      : 'desc';

  return {
    limit,
    page,
    sortKey,
    sortDirection,
  };
};

const delegatorLeaderboardQuery = async ({
  limit,
  page,
  sortKey,
  sortDirection,
}: DelegatorLeaderboardRequest) => {
  return pindexerDb
    .selectFrom('lqt.delegator_summary as summary')
    .selectAll()
    .orderBy(sortKey, sortDirection)
    .orderBy('epochs_voted_in', 'desc')
    .offset(limit * (page - 1))
    .limit(limit)
    .execute();
};

const totalDelegatorsQuery = async () => {
  return pindexerDb
    .selectFrom('lqt.delegator_summary')
    .select(exp => [exp.fn.countAll().as('total')])
    .executeTakeFirst();
};

export async function GET(
  req: NextRequest,
): Promise<NextResponse<Serialized<DelegatorLeaderboardApiResponse | { error: string }>>> {
  const params = getQueryParams(req);

  const [results, total] = await Promise.all([
    delegatorLeaderboardQuery(params),
    totalDelegatorsQuery(),
  ]);

  const mapped = results
    .map<DelegatorLeaderboardData>(item => ({
      streak: item.streak,
      total_rewards: item.total_rewards,
      total_voting_power: item.total_voting_power,
      epochs_voted_in: Number(item.epochs_voted_in),
      address: new Address({
        inner: item.address,
      }),
    }))
    .filter(Boolean);

  return NextResponse.json({
    total: Number(total?.total ?? 0),
    data: serialize(mapped),
  });
}
