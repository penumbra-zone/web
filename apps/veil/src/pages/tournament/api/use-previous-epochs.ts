import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import type {
  PreviousEpochsApiResponse,
  PreviousEpochsRequest,
  PreviousEpochsSortDirection,
  PreviousEpochsSortKey,
} from '../server/previous-epochs';

export const BASE_LIMIT = 10;
export const BASE_PAGE = 1;

export const usePreviousEpochs = (
  connected: boolean,
  page = BASE_PAGE,
  limit = BASE_LIMIT,
  sortKey?: PreviousEpochsSortKey,
  sortDirection?: PreviousEpochsSortDirection,
) => {
  const query = useQuery({
    queryKey: ['previous-epochs', connected, page, limit, sortKey, sortDirection],
    queryFn: async () => {
      return apiFetch<PreviousEpochsApiResponse>('/api/tournament/previous-epochs', {
        limit,
        page,
        sortKey,
        sortDirection,
      } satisfies Partial<PreviousEpochsRequest>);
    },
  });

  return {
    query,
    data: query.data?.data,
    total: query.data?.total ?? 0,
  };
};
