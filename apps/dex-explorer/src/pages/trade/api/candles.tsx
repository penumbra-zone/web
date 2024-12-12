import { useQuery } from '@tanstack/react-query';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';
import { CandleApiResponse } from '@/shared/api/server/candles/types.ts';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { DurationWindow } from '@/shared/utils/duration.ts';
import { CandleWithVolume } from '@/shared/api/server/candles/utils.ts';

export const useCandles = (durationWindow: DurationWindow) => {
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  const query = useQuery({
    queryKey: ['candles', baseSymbol, quoteSymbol, durationWindow],
    queryFn: async (): Promise<CandleWithVolume[]> => {
      const paramsObj = {
        baseAsset: baseSymbol,
        quoteAsset: quoteSymbol,
        durationWindow,
      };
      const baseUrl = '/api/candles';
      const urlParams = new URLSearchParams(paramsObj).toString();
      const res = await fetch(`${baseUrl}?${urlParams}`);
      const jsonRes = (await res.json()) as CandleApiResponse;
      if ('error' in jsonRes) {
        throw new Error(jsonRes.error);
      }
      return jsonRes;
    },
  });

  useRefetchOnNewBlock(query);

  return query;
};
