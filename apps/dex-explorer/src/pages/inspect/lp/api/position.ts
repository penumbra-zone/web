import { useQuery } from '@tanstack/react-query';
import { PositionTimelineResponse } from '@/shared/api/server/position/timeline/types';
import { apiFetch } from '@/shared/utils/api-fetch.ts';

export const useLpPosition = (id: string) => {
  return useQuery({
    queryKey: ['lpPosition', id],
    retry: 1,
    queryFn: async () =>
      apiFetch<PositionTimelineResponse>(`/api/position/timeline?positionId=${id}`),
  });
};
