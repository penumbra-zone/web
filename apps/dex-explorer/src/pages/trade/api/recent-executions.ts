import { useQuery } from '@tanstack/react-query';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { apiFetch } from '@/shared/utils/api-fetch.ts';
import { RecentExecution } from '@/shared/api/server/recent-executions.ts';

const LIMIT = 10;

export const useRecentExecutions = () => {
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  const query = useQuery({
    queryKey: ['recent-executions', baseSymbol, quoteSymbol],
    queryFn: async () => {
      return apiFetch<RecentExecution[]>('/api/recent-executions', {
        baseAsset: baseSymbol,
        quoteAsset: quoteSymbol,
        limit: String(LIMIT),
      });
    },
  });

  useRefetchOnNewBlock('recent-executions', query);

  return query;
};
