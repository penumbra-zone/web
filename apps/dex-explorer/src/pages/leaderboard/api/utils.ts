import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

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
  interval: LeaderboardIntervalFilter;
  limit: number;
  base?: string;
  quote?: string;
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
}

export interface LeaderboardPageInfo {
  data: LeaderboardData[];
  filters: LeaderboardSearchParams;
}

export const getURLParams = (searchParams: URLSearchParams): LeaderboardSearchParams => {
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const base = searchParams.get('base') ?? undefined;
  const quote = searchParams.get('quote') ?? undefined;
  const interval = (searchParams.get('interval') ?? DEFAULT_INTERVAL) as LeaderboardIntervalFilter;

  return {
    limit,
    interval,
    base,
    quote,
  };
};
