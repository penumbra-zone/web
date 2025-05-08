import { useQuery } from '@tanstack/react-query';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import type { TournamentSummaryRequest, TournamentSummaryApiResponse } from '../server/summary';
import { apiPostFetch } from '@/shared/utils/api-fetch';
import { useMemo } from 'react';

export const useTournamentSummary = (
  params?: Partial<TournamentSummaryRequest>,
  disabled?: boolean,
) => {
  const epochsKey = useMemo(
    () => (params?.epochs ? JSON.stringify(params.epochs) : undefined),
    [params?.epochs],
  );

  const query = useQuery({
    queryKey: ['tournament-summary', params?.limit, params?.page, epochsKey],
    enabled: !disabled,
    staleTime: Infinity,
    queryFn: async () => {
      const requestParams = {
        limit: params?.limit!,
        page: params?.page!,
        ...(params?.epochs && params.epochs.length > 0 ? { epochs: params.epochs } : {}),
      };

      const response = await apiPostFetch<TournamentSummaryApiResponse>(
        '/api/tournament/summary',
        requestParams,
      );

      return response.data;
    },
  });

  useRefetchOnNewBlock('tournament-summary', query, disabled);

  return query;
};
