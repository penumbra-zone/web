import { useQuery } from '@tanstack/react-query';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { DurationWindow } from '@/shared/utils/duration.ts';
import { NoSummaryData, SummaryData } from '@/shared/api/server/summary/types.ts';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';
import { apiFetch } from '@/shared/utils/api-fetch';

export const useSummary = (window: DurationWindow) => {
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  const query = useQuery({
    queryKey: ['summary', baseSymbol, quoteSymbol],
    retry: 1,
    queryFn: async () => {
      return apiFetch<SummaryData | NoSummaryData>('/api/summary', {
        durationWindow: window,
        baseAsset: baseSymbol,
        quoteAsset: quoteSymbol,
      });
    },
  });

  useRefetchOnNewBlock('summary', query);

  return query;
};
