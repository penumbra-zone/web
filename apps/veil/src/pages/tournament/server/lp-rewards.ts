import { NextRequest, NextResponse } from 'next/server';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { positionIdFromBech32 } from '@penumbra-zone/bech32m/plpid';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';

const SORT_KEYS = ['epoch', 'position_id', 'reward', ''] as const;
export type LpRewardsSortKey = (typeof SORT_KEYS)[number];

const DIRECTIONS = ['asc', 'desc'] as const;
export type LpRewardsSortDirection = (typeof DIRECTIONS)[number];

export interface LpRewardsRequest {
  positionIds: string[];
  limit: number;
  page: number;
  sortKey: LpRewardsSortKey;
  sortDirection: LpRewardsSortDirection;
}

export interface LqtLp {
  epoch: number;
  position_id: string;
  asset_id: string;
  rewards: number;
  executions: number;
  um_volume: number;
  asset_volume: number;
  asset_fees: number;
  points: number;
  points_share: number;
}

export interface LpRewardsApiResponse {
  data: LqtLp[];
  total: number;
}

async function queryLqtLps({ positionIds, sortKey, sortDirection, limit, page }: LpRewardsRequest) {
  const positionIdsBytes = positionIds.map(positionId => positionIdFromBech32(positionId).inner);

  return pindexerDb
    .selectFrom('lqt._lp_rewards')
    .selectAll()
    .where('position_id', 'in', positionIdsBytes)
    .orderBy(sortKey ?? 'epoch', sortDirection)
    .offset(limit * (page - 1))
    .limit(limit)
    .execute();
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<Serialized<LpRewardsApiResponse>>> {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    return NextResponse.json({ error: 'PENUMBRA_CHAIN_ID is not set' }, { status: 500 });
  }

  const params = (await req.json()) as LpRewardsRequest;
  const lps = await queryLqtLps(params);

  return NextResponse.json(
    serialize({
      data: lps.map(lp => ({
        epoch: lp.epoch,
        position_id: bech32mPositionId(lp.position_id),
        asset_id: lp.asset_id,
        rewards: lp.reward,
        executions: lp.executions,
        um_volume: lp.um_volume,
        asset_volume: lp.asset_volume,
        asset_fees: lp.asset_fees,
        points: lp.points,
        points_share: lp.points_share,
      })),
      total: lps.length,
    }),
  );
}
