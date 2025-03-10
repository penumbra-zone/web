'use client';

import { useQuery } from '@tanstack/react-query';
import type { StatsData } from '@/shared/api/server/stats';
import { apiFetch } from '@/shared/utils/api-fetch';

export const useStats = () => {
  return useQuery<StatsData>({
    queryKey: ['stats'],
    queryFn: async () => {
      return apiFetch<StatsData>('/api/stats');
    },
  });
};
