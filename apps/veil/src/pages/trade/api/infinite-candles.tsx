import { useInfiniteQuery } from '@tanstack/react-query';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { DurationWindow } from '@/shared/utils/duration.ts';
import { CandleWithVolume } from '@/shared/api/server/candles/utils.ts';
import { apiFetch } from '@/shared/utils/api-fetch';

const CANDLES_LIMIT = 100;

/**
 * Paginated candles query – requests 100 candles per page and wait for users to scroll the chart.
 */
export const useInfiniteCandles = (durationWindow: DurationWindow) => {
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  return useInfiniteQuery<CandleWithVolume[]>({
    queryKey: ['infinite-candles', baseSymbol, quoteSymbol, durationWindow],
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.length ? (lastPageParam as number) + 1 : undefined;
    },
    queryFn: async ({ pageParam }): Promise<CandleWithVolume[]> => {
      return apiFetch<CandleWithVolume[]>('/api/candles', {
        baseAsset: baseSymbol,
        quoteAsset: quoteSymbol,
        page: pageParam as number,
        limit: CANDLES_LIMIT,
        durationWindow,
      });
    },
  });
};
