import { NextRequest, NextResponse } from 'next/server';
import { Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { LQTSummary } from '@/shared/database/schema';

export interface TournamentSummaryRequest {
  limit: number;
  page: number;
}

const DEFAULT_LIMIT = 10;

export const getQueryParams = (req: NextRequest): TournamentSummaryRequest => {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const page = Number(searchParams.get('page')) || 1;

  return {
    limit,
    page,
  };
};

export interface TournamentSummaryApiResponse {
  data: LQTSummary[];
}

const tournamentSummaryQuery = async ({ limit, page }: TournamentSummaryRequest) => {
  return pindexerDb
    .selectFrom('lqt.summary')
    .orderBy('epoch', 'desc')
    .limit(limit)
    .offset(limit * (page - 1))
    .selectAll()
    .execute();
};

export async function GET(
  req: NextRequest,
): Promise<NextResponse<Serialized<TournamentSummaryApiResponse | { error: string }>>> {
  const params = getQueryParams(req);
  const response = await tournamentSummaryQuery(params);

  return NextResponse.json({
    data: response,
  });
}
