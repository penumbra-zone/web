import { useQuery } from '@tanstack/react-query';
import type { PairData } from '@/shared/api/server/summary/pairs';
import { apiFetch } from '@/shared/utils/api-fetch';

// Fetches the array of popular (sorted by liquidity) pairs
export const usePairs = () => {
  return useQuery({
    queryKey: ['pairs'],
    queryFn: async () => {
      return apiFetch<PairData[]>('/api/pairs');
    },
  });
};
