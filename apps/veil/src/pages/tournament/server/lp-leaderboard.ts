import { NextRequest, NextResponse } from 'next/server';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { JsonObject } from '@bufbuild/protobuf';

const SORT_KEYS = ['epoch', 'position_id', 'rewards'] as const;
export type LpLeaderboardSortKey = (typeof SORT_KEYS)[number];

const DIRECTIONS = ['asc', 'desc'] as const;
export type LpLeaderboardSortDirection = (typeof DIRECTIONS)[number];

export interface LpLeaderboardRequest extends JsonObject {
  epoch: number;
  limit: number;
  page: number;
  sortKey: LpLeaderboardSortKey;
  sortDirection: LpLeaderboardSortDirection;
}

export interface LqtLp {
  epoch: number;
  positionId: PositionId;
  assetId: AssetId;
  rewards: number;
  executions: number;
  umVolume: number;
  assetVolume: number;
  assetFees: number;
  points: number;
  pointsShare: number;
}

export interface LpLeaderboardApiResponse {
  data: LqtLp[];
  total: number;
  totalRewards: number;
}

async function queryLqtLps({ epoch, sortKey, sortDirection, limit, page }: LpLeaderboardRequest) {
  const [totalStats, results] = await Promise.all([
    pindexerDb
      .selectFrom('lqt.lps')
      .select(eb => [eb.fn.count('position_id').as('total_positions')])
      .where('epoch', '=', epoch)
      .executeTakeFirst(),
    pindexerDb
      .selectFrom('lqt.lps')
      .selectAll()
      .where('epoch', '=', epoch)
      .orderBy(sortKey, sortDirection)
      .offset(limit * (page - 1))
      .limit(limit)
      .execute(),
  ]);

  return {
    data: results,
    total: Number(totalStats?.total_positions ?? 0),
  };
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<Serialized<LpLeaderboardApiResponse>>> {
  const params = (await req.json()) as LpLeaderboardRequest;
  const lps = await queryLqtLps(params);

  return NextResponse.json(
    serialize({
      data: lps.data.map(lp => ({
        epoch: lp.epoch,
        positionId: new PositionId({ inner: lp.position_id }),
        assetId: new AssetId({ inner: lp.asset_id }),
        rewards: lp.rewards,
        executions: lp.executions,
        umVolume: lp.um_volume,
        assetVolume: lp.asset_volume,
        assetFees: lp.asset_fees,
        points: lp.points,
        pointsShare: lp.points_share,
      })),
      total: lps.total,
    }),
  );
}
