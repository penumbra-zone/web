import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import { EpochResultsRequest, EpochResultsApiResponse } from '../server/epoch-results';

export const useEpochResults = (
  params: Partial<EpochResultsRequest>,
  additionalKeys?: unknown[],
) => {
  const query = useQuery({
    queryKey: [
      'epoch-gauge',
      params.epoch,
      params.limit,
      params.page,
      params.sortKey,
      params.sortDirection,
      ...(additionalKeys ?? []),
    ],
    enabled: !!params.epoch,
    queryFn: async () => {
      return apiFetch<EpochResultsApiResponse>('/api/tournament/epoch-results', params);
    },
  });

  useRefetchOnNewBlock('epoch-gauge', query);

  return query;
};
