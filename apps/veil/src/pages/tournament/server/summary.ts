import { NextRequest, NextResponse } from 'next/server';
import { Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { LqtSummary } from '@/shared/database/schema';

export interface TournamentSummaryRequest {
  limit: number;
  page: number;
  epoch?: number;
}

const DEFAULT_LIMIT = 10;

export const getQueryParams = (req: NextRequest): TournamentSummaryRequest => {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const page = Number(searchParams.get('page')) || 1;

  const epoch = Number(searchParams.get('epoch')) || undefined;

  return {
    epoch,
    limit,
    page,
  };
};

export interface TournamentSummaryApiResponse {
  data: LqtSummary[];
}

const tournamentSummaryQuery = async ({ limit, page, epoch }: TournamentSummaryRequest) => {
  return pindexerDb
    .selectFrom('lqt.summary')
    .orderBy('epoch', 'desc')
    .limit(limit)
    .offset(limit * (page - 1))
    .selectAll()
    .$if(!!epoch, qb => (epoch ? qb.where('epoch', '=', epoch) : qb))
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
