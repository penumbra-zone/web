import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import type {
  DelegatorLeaderboardApiResponse,
  DelegatorLeaderboardRequest,
  DelegatorLeaderboardSortKey,
} from '../../../shared/api/server/tournament/delegator-leaderboard';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export const useDelegatorLeaderboard = (
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: DelegatorLeaderboardSortKey | '',
  sortDirection?: 'asc' | 'desc',
) => {
  const query = useQuery({
    queryKey: ['delegator-leaderboard', page, limit, sortKey, sortDirection],
    queryFn: async () => {
      return apiFetch<DelegatorLeaderboardApiResponse>('/api/tournament/delegator-leaderboard', {
        limit,
        page,
        sortDirection,
        sortKey: sortKey ? sortKey : undefined,
      } satisfies Partial<DelegatorLeaderboardRequest>);
    },
  });

  return {
    query,
    data: query.data?.data,
    total: query.data?.total ?? 0,
  };
};
