import { useInfiniteQuery } from '@tanstack/react-query';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { DurationWindow } from '@/shared/utils/duration.ts';
import { CandleWithVolume } from '@/shared/api/server/candles/utils.ts';
import { apiFetch } from '@/shared/utils/api-fetch';

const CANDLES_LIMIT = 100;

export const useCandles = (durationWindow: DurationWindow) => {
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  const query = useInfiniteQuery<CandleWithVolume[]>({
    queryKey: ['candles', baseSymbol, quoteSymbol, durationWindow],
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return (lastPage as CandleWithVolume[]).length ? lastPageParam + 1 : undefined;
    },
    queryFn: async ({ pageParam }): Promise<CandleWithVolume[]> => {
      return apiFetch<CandleWithVolume[]>('/api/candles', {
        baseAsset: baseSymbol,
        quoteAsset: quoteSymbol,
        page: pageParam,
        limit: CANDLES_LIMIT,
        durationWindow,
      });
    },
  });

  useRefetchOnNewBlock('candles', query);

  return query;
};
