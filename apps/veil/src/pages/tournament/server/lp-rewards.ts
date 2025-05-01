import { NextRequest, NextResponse } from 'next/server';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import { positionIdFromBech32 } from '@penumbra-zone/bech32m/plpid';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { JsonObject } from '@bufbuild/protobuf';

const SORT_KEYS = ['epoch', 'position_id', 'reward'] as const;
export type LpRewardsSortKey = (typeof SORT_KEYS)[number];

const DIRECTIONS = ['asc', 'desc'] as const;
export type LpRewardsSortDirection = (typeof DIRECTIONS)[number];

export interface LpRewardsRequest extends JsonObject {
  positionIds: string[];
  limit: number;
  page: number;
  sortKey: LpRewardsSortKey;
  sortDirection: LpRewardsSortDirection;
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

export interface LpRewardsApiResponse {
  data: LqtLp[];
  total: number;
}

async function queryLqtLps({ positionIds, sortKey, sortDirection, limit, page }: LpRewardsRequest) {
  const positionIdsBytes = positionIds.map(positionId => positionIdFromBech32(positionId).inner);

  return pindexerDb
    .selectFrom('lqt._lp_rewards')
    .selectAll()
    .where('position_id', 'in', positionIdsBytes as Buffer<ArrayBufferLike>[])
    .orderBy(sortKey === 'reward' ? 'amount' : sortKey, sortDirection)
    .offset(limit * (page - 1))
    .limit(limit)
    .execute();
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<Serialized<LpRewardsApiResponse>>> {
  const params = (await req.json()) as LpRewardsRequest;
  const lps = await queryLqtLps(params);

  return NextResponse.json(
    serialize({
      data: lps.map(lp => ({
        epoch: lp.epoch,
        positionId: new PositionId({ inner: lp.position_id }),
        assetId: new AssetId({ inner: lp.asset_id }),
        rewards: lp.amount,
        executions: lp.executions,
        umVolume: lp.um_volume,
        assetVolume: lp.asset_volume,
        assetFees: lp.asset_fees,
        points: lp.points,
        pointsShare: lp.points / 10,
      })),
      total: lps.length,
    }),
  );
}
