import { JsonObject } from '@bufbuild/protobuf';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  Position,
  PositionId,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export type LpLeaderboardSortKey = 'executions' | 'points';
export type LpLeaderboardSortDirection = 'asc' | 'desc';

export interface LpLeaderboardRequest extends JsonObject {
  positionIds: string[];
  epoch: number;
  limit: number;
  page: number;
  sortKey: LpLeaderboardSortKey;
  sortDirection: LpLeaderboardSortDirection;
  assetId: string | null;
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

export interface LpLeaderboard extends LqtLp {
  position: Position;
  positionIdString: string;
}

export interface LpLeaderboardResponse {
  data: LpLeaderboard[];
  total: number;
}

export interface LpLeaderboardErrorResponse {
  error: string;
}
