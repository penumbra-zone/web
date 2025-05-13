import { JsonObject } from '@bufbuild/protobuf';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  Position,
  PositionId,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { connectionStore } from '@/shared/model/connection';
import { getGrpcTransport } from '@/shared/api/transport';
import { penumbra } from '@/shared/const/penumbra';
import { createClient } from '@connectrpc/connect';
import { DexService } from '@penumbra-zone/protobuf';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';

const SORT_KEYS = ['executions', 'points'] as const;
export type LpLeaderboardSortKey = (typeof SORT_KEYS)[number];

const DIRECTIONS = ['asc', 'desc'] as const;
export type LpLeaderboardSortDirection = (typeof DIRECTIONS)[number];

export interface LpLeaderboardRequest extends JsonObject {
  positionIds: string[];
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
  umFees: number;
  assetFees: number;
  points: number;
  pointsShare: number;
}

export interface LpLeaderboardApiResponse {
  data: LqtLp[];
  total: number;
}

export interface LpLeaderboard extends LqtLp {
  position: Position;
  positionIdString: string;
}

export interface LpLeaderboardResponse extends LpLeaderboardApiResponse {
  data: LpLeaderboard[];
  total: number;
}

// get the position state for each lp reward
export async function enrichLpLeaderboards(data: LqtLp[]): Promise<LpLeaderboard[]> {
  if (data.length === 0) {
    return [];
  }

  const grpc = !connectionStore.connected ? await getGrpcTransport() : undefined;
  const payload = { positionId: data.map(lp => lp.positionId) };
  const positionsRes = await Array.fromAsync(
    grpc
      ? createClient(DexService, grpc.transport).liquidityPositionsById(payload)
      : penumbra.service(DexService).liquidityPositionsById(payload),
  );
  const positions = positionsRes.map(r => r.data).filter(Boolean) as Position[];

  return data.map((lp, index) => ({
    ...lp,
    positionIdString: bech32mPositionId(lp.positionId),
    position: positions[index] as unknown as Position,
  }));
}
