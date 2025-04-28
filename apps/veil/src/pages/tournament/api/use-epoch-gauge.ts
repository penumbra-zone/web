import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import type {
  PreviousEpochsApiResponse,
  PreviousEpochsRequest,
} from '@/shared/api/server/tournament/previous-epochs';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';

export const useEpochGauge = (epoch?: number) => {
  const query = useQuery({
    queryKey: ['epoch-gauge', epoch],
    enabled: !!epoch,
    queryFn: async () => {
      const res = await apiFetch<PreviousEpochsApiResponse>('/api/tournament/previous-epochs', {
        epoch,
        limit: 1,
        page: 1,
      } satisfies Partial<PreviousEpochsRequest>);

      return res.data[0]?.gauge ?? [];
    },
  });

  useRefetchOnNewBlock('epoch-gauge', query);

  return query;
};
