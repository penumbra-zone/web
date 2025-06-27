import { useQuery } from '@tanstack/react-query';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { DurationWindow } from '@/shared/utils/duration.ts';
import { CandleWithVolume } from '@/shared/api/server/candles/utils.ts';
import { apiFetch } from '@/shared/utils/api-fetch';

const CANDLES_LIMIT = 5;

/**
 * 5 latest candles updated on each new block.
 */
export const useLatestCandles = (durationWindow: DurationWindow) => {
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  const query = useQuery<CandleWithVolume[]>({
    queryKey: ['latest-candles', baseSymbol, quoteSymbol, durationWindow],
    queryFn: async (): Promise<CandleWithVolume[]> => {
      return apiFetch<CandleWithVolume[]>('/api/candles', {
        baseAsset: baseSymbol,
        quoteAsset: quoteSymbol,
        limit: CANDLES_LIMIT,
        durationWindow,
      });
    },
  });

  useRefetchOnNewBlock('candles', query);

  return query;
};
