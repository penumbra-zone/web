import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/shared/utils/api-fetch';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';
import type { TournamentSummaryRequest, TournamentSummaryApiResponse } from '../server/summary';

export const useTournamentSummary = (
  params?: Partial<TournamentSummaryRequest>,
  disabled?: boolean,
) => {
  const query = useQuery({
    queryKey: ['tournament-summary'],
    enabled: !disabled,
    staleTime: Infinity,
    queryFn: async () => {
      const res = await apiFetch<TournamentSummaryApiResponse>('/api/tournament/summary', params);
      return res.data;
    },
  });

  useRefetchOnNewBlock('tournament-summary', query, disabled);

  return query;
};
