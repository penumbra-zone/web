import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiPostFetch } from '@/shared/utils/api-fetch';
import {
  LpLeaderboardRequest,
  LpLeaderboardResponse,
  LpLeaderboardSortKey,
  LpLeaderboardSortDirection,
} from './utils';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export const useLpLeaderboard = ({
  epoch,
  page,
  limit,
  sortKey,
  sortDirection,
  isActive,
  assetId,
}: {
  epoch: number | undefined;
  page: number;
  limit: number;
  sortKey?: LpLeaderboardSortKey | '';
  sortDirection?: LpLeaderboardSortDirection;
  isActive: boolean;
  assetId: string | undefined;
}): UseQueryResult<LpLeaderboardResponse> => {
  const queryKey = ['lp-leaderboard', epoch, page, limit, sortKey, sortDirection, assetId];
  const query = useQuery({
    queryKey,
    staleTime: Infinity,
    queryFn: async () => {
      return apiPostFetch<LpLeaderboardResponse>('/api/tournament/lp-leaderboard', {
        epoch,
        page,
        limit,
        sortKey,
        sortDirection,
        assetId,
      } as LpLeaderboardRequest);
    },
    enabled: typeof epoch === 'number' && isActive,
  });
  useRefetchOnNewBlock('lp-leaderboard', query);

  return query;
};
