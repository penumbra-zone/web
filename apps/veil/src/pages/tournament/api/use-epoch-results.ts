import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import { EpochResultsRequest, EpochResultsApiResponse } from '../server/epoch-results';

export const useEpochResults = (
  name: string,
  params: Partial<EpochResultsRequest>,
  disabled?: boolean,
) => {
  const query = useQuery({
    queryKey: [name, params.epoch, params.limit, params.page, params.sortKey, params.sortDirection],
    enabled: !disabled,
    queryFn: async () => {
      return apiFetch<EpochResultsApiResponse>('/api/tournament/epoch-results', params);
    },
  });

  useRefetchOnNewBlock(name, query, disabled);

  return query;
};
