import { NextRequest, NextResponse } from 'next/server';
import { serialize, Serialized } from '@/shared/utils/serializer';
import { pindexerDb } from '@/shared/database/client';
import {
  Position,
  PositionId,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { bech32mPositionId, positionIdFromBech32 } from '@penumbra-zone/bech32m/plpid';
import { LpLeaderboardRequest, LpLeaderboardResponse, LpLeaderboardErrorResponse } from './utils';
import { hexToUint8Array } from '@penumbra-zone/types/hex';
import { DexService } from '@penumbra-zone/protobuf';
import { createClient } from '@/shared/utils/protos/utils.ts';

async function queryLqtLps({
  positionIds = [],
  epoch,
  sortKey,
  sortDirection,
  limit,
  page,
  assetId,
}: LpLeaderboardRequest) {
  const positionIdsBytes = positionIds
    .map(positionId => positionIdFromBech32(positionId).inner)
    .map(posIdInner => Buffer.from(posIdInner));

  const [totalStats, results] = positionIdsBytes.length
    ? await Promise.all([
        pindexerDb
          .selectFrom('lqt.lps')
          .select(eb => [eb.fn.count('position_id').as('total_positions')])
          .where('epoch', '=', epoch)
          .$if(!!assetId, qb =>
            qb.where('asset_id', '=', Buffer.from(hexToUint8Array(assetId ?? ''))),
          )
          .where('position_id', 'in', positionIdsBytes)
          .executeTakeFirst(),
        pindexerDb
          .selectFrom('lqt.lps')
          .selectAll()
          .where('epoch', '=', epoch)
          .$if(!!assetId, qb =>
            qb.where('asset_id', '=', Buffer.from(hexToUint8Array(assetId ?? ''))),
          )
          .where('position_id', 'in', positionIdsBytes)
          .orderBy(sortKey, sortDirection)
          .offset(limit * (page - 1))
          .limit(limit)
          .execute(),
      ])
    : await Promise.all([
        pindexerDb
          .selectFrom('lqt.lps')
          .select(eb => [eb.fn.count('position_id').as('total_positions')])
          .where('epoch', '=', epoch)
          .$if(!!assetId, qb =>
            qb.where('asset_id', '=', Buffer.from(hexToUint8Array(assetId ?? ''))),
          )
          .executeTakeFirst(),
        pindexerDb
          .selectFrom('lqt.lps')
          .selectAll()
          .where('epoch', '=', epoch)
          .$if(!!assetId, qb =>
            qb.where('asset_id', '=', Buffer.from(hexToUint8Array(assetId ?? ''))),
          )
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
): Promise<NextResponse<Serialized<LpLeaderboardResponse> | LpLeaderboardErrorResponse>> {
  const grpcEndpoint = process.env['PENUMBRA_GRPC_ENDPOINT'];
  if (!grpcEndpoint) {
    return NextResponse.json({ error: 'PENUMBRA_GRPC_ENDPOINT is not set' }, { status: 500 });
  }

  const params = (await req.json()) as LpLeaderboardRequest;
  const lps = await queryLqtLps(params);

  const lqtLps = lps.data.map(lp => ({
    epoch: lp.epoch,
    positionId: new PositionId({ inner: lp.position_id }),
    assetId: new AssetId({ inner: lp.asset_id }),
    rewards: lp.rewards,
    executions: lp.executions,
    umVolume: lp.um_volume,
    assetVolume: lp.asset_volume,
    umFees: lp.um_fees,
    assetFees: lp.asset_fees,
    points: lp.points,
    pointsShare: lp.point_share,
  }));

  const client = createClient(grpcEndpoint, DexService);
  const positionsRes = await Array.fromAsync(
    client.liquidityPositionsById({
      positionId: lqtLps.map(lp => lp.positionId),
    }),
  );
  const positions = positionsRes.map(r => r.data).filter(Boolean) as Position[];

  return NextResponse.json(
    serialize({
      data: lqtLps.map((lp, index) => ({
        ...lp,
        positionIdString: bech32mPositionId(lp.positionId),
        position: positions[index] as unknown as Position,
      })),
      total: lps.total,
    }),
  );
}
