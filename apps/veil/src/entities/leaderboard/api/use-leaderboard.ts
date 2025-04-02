'use client';

import { useQuery } from '@tanstack/react-query';
import type { LeaderboardPageInfo, LeaderboardSearchParams } from './utils';
import { apiFetch } from '@/shared/utils/api-fetch';

export const useLeaderboard = (filters: Partial<LeaderboardSearchParams>) => {
  return useQuery<LeaderboardPageInfo>({
    queryKey: [
      'leaderboard',
      filters.startBlock,
      filters.endBlock,
      filters.quote,
      filters.limit,
      filters.offset,
    ],
    queryFn: async () => {
      const resp = await apiFetch<LeaderboardPageInfo>('/api/position/leaderboard', {
        ...(filters.quote && { quote: filters.quote }),
        startBlock: filters.startBlock,
        endBlock: filters.endBlock,
        limit: filters.limit,
        offset: filters.offset,
      } as unknown as Record<string, string>);

      return resp;
    },
  });
};
