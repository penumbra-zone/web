import { NextRequest, NextResponse } from 'next/server';
import { Serialized, serialize } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { LqtSummary } from '@/shared/database/schema';

const DIRECTIONS = ['asc', 'desc'] as const;
export type TournamentSummaryDirection = (typeof DIRECTIONS)[number];

export interface TournamentSummaryRequest {
  limit: number;
  page: number;
  epochs?: number[];
  sortDirection?: TournamentSummaryDirection;
}

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export const getQueryParams = (req: NextRequest): TournamentSummaryRequest => {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get('limit')) || BASE_LIMIT;
  const page = Number(searchParams.get('page')) || BASE_PAGE;

  const sortDirectionParam = searchParams.get('sortDirection');
  const sortDirection =
    sortDirectionParam && DIRECTIONS.includes(sortDirectionParam as TournamentSummaryDirection)
      ? (sortDirectionParam as TournamentSummaryDirection)
      : 'desc';

  return {
    limit,
    page,
    sortDirection,
  };
};

export interface TournamentSummaryApiResponse {
  total: number;
  data: LqtSummary[];
}

const tournamentSummaryQuery = async ({
  limit,
  page,
  epochs,
  sortDirection = 'desc',
}: TournamentSummaryRequest) => {
  let query = pindexerDb.selectFrom('lqt.summary').orderBy('epoch', sortDirection);

  if (epochs && epochs.length > 0) {
    query = query.where('epoch', 'in', epochs);
  }

  return query
    .limit(limit)
    .offset(limit * (page - 1))
    .selectAll()
    .execute();
};

const totalSummaryCountQuery = async (epochs?: number[]) => {
  let query = pindexerDb.selectFrom('lqt.summary').select(expr => [expr.fn.countAll().as('total')]);

  if (epochs && epochs.length > 0) {
    query = query.where('epoch', 'in', epochs);
  }

  return query.executeTakeFirst();
};

export async function POST(
  req: NextRequest,
): Promise<NextResponse<Serialized<TournamentSummaryApiResponse | { error: string }>>> {
  const urlParams = getQueryParams(req);
  const bodyData = (await req.json()) as Partial<TournamentSummaryRequest>;

  // Merge URL params with body data
  const params: TournamentSummaryRequest = {
    ...urlParams,
    ...bodyData,
  };

  const [results, total] = await Promise.all([
    tournamentSummaryQuery(params),
    totalSummaryCountQuery(params.epochs),
  ]);

  return NextResponse.json({
    total: Number(total?.total ?? 0),
    data: serialize(results),
  });
}
