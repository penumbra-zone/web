import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import type { CurrentEpochApiResponse } from '../server/current-epoch';

export const useCurrentEpoch = () => {
  const query = useQuery({
    queryKey: ['current-epoch'],
    staleTime: Infinity,
    queryFn: async () => {
      const res = await apiFetch<CurrentEpochApiResponse>('/api/tournament/current-epoch');
      return res.epoch;
    },
  });

  useRefetchOnNewBlock('current-epoch', query);

  return query;
}
