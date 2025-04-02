import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export const INTERVAL_FILTER = ['1h', '6h', '24h', '7d', '30d'] as const;
export type LeaderboardIntervalFilter = (typeof INTERVAL_FILTER)[number];
export const intervalFilterToSQL: Record<LeaderboardIntervalFilter, string> = {
  '1h': '1 hour',
  '6h': '6 hours',
  '24h': '1 day',
  '7d': '1 week',
  '30d': '1 month',
};

export const DEFAULT_INTERVAL: LeaderboardIntervalFilter = '7d';
export const DEFAULT_LIMIT = 30;

export interface LeaderboardSearchParams {
  limit: number;
  offset: number;
  quote: string | undefined;
  startBlock: number;
  endBlock: number;
}

export interface LeaderboardData {
  asset1: Metadata;
  asset2: Metadata;
  positionId: string;
  volume1: ValueView;
  volume2: ValueView;
  fees1: ValueView;
  fees2: ValueView;
  executions: number;
  openingTime: number;
  closingTime: number;
  state: PositionState_PositionStateEnum;
  pnlPercentage: number;
}

export interface LeaderboardPageInfo {
  data: LeaderboardData[];
  filters: LeaderboardSearchParams;
  totalCount: number;
}

export const getURLParams = (searchParams: URLSearchParams): LeaderboardSearchParams => {
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const offset = Number(searchParams.get('offset')) || 0;
  const quote = searchParams.get('quote') ?? undefined;
  const startBlock = Number(searchParams.get('startBlock')) || 0;
  const endBlock = Number(searchParams.get('endBlock')) || 0;

  return {
    limit,
    offset,
    quote,
    startBlock,
    endBlock,
  };
};
