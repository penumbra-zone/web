import { NextResponse } from 'next/server';
import { Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';

export interface CurrentEpochApiResponse {
  epoch: number;
}

const currentEpochQuery = async () => {
  return pindexerDb
    .selectFrom('lqt.summary')
    .orderBy('epoch', 'desc')
    .limit(1)
    .select(['epoch'])
    .executeTakeFirst();
};

export async function GET(): Promise<NextResponse<Serialized<CurrentEpochApiResponse | { error: string }>>> {
  const response = await currentEpochQuery();

  if (!response?.epoch) {
    return NextResponse.json({ error: 'No current epoch found' }, { status: 404 });
  }

  return NextResponse.json({
    epoch: response.epoch,
  });
}
