import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiPostFetch } from '@/shared/utils/api-fetch';
import { statusStore } from '@/shared/model/status';
import { useCurrentEpoch } from '@/pages/tournament/api/use-current-epoch';
import {
  LpLeaderboardRequest,
  LpLeaderboardApiResponse,
  LpLeaderboardSortKey,
  LpLeaderboardSortDirection,
  LpLeaderboardResponse,
  enrichLpLeaderboards,
} from './utils';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export const useLpLeaderboard = ({
  epoch,
  page,
  limit,
  sortKey,
  sortDirection,
  isActive,
}: {
  epoch: number | undefined;
  page: number;
  limit: number;
  sortKey?: LpLeaderboardSortKey | '';
  sortDirection?: LpLeaderboardSortDirection;
  isActive: boolean;
}): UseQueryResult<LpLeaderboardResponse> => {
  const { latestKnownBlockHeight } = statusStore;
  const { epoch: currentEpoch } = useCurrentEpoch();

  const query = useQuery({
    queryKey: [
      'lp-leaderboard',
      epoch,
      page,
      limit,
      sortKey,
      sortDirection,
      ...(epoch === currentEpoch ? [Number(latestKnownBlockHeight)] : []),
    ],
    staleTime: Infinity,
    queryFn: async () => {
      return apiPostFetch<LpLeaderboardApiResponse>('/api/tournament/lp-leaderboard', {
        epoch,
        page,
        limit,
        sortKey,
        sortDirection,
      } as LpLeaderboardRequest).then(async resp => ({
        ...resp,
        data: await enrichLpLeaderboards(resp.data),
      }));
    },
    enabled:
      typeof epoch === 'number' &&
      isActive &&
      (epoch === currentEpoch ? !!latestKnownBlockHeight : true),
  });

  return query;
};
