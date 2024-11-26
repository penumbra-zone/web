import { useQuery } from '@tanstack/react-query';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block.ts';
import { CandleApiResponse } from '@/shared/api/server/candles/types.ts';
import { usePathSymbols } from '@/pages/trade/model/use-path.ts';
import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { addDurationWindow, DurationWindow } from '@/shared/utils/duration.ts';

/** Insert empty candles so that every timestamp as one candle. */
const insertEmptyCandles = (
  window: DurationWindow,
  data: OhlcData<UTCTimestamp>[],
): OhlcData<UTCTimestamp>[] => {
  const out: OhlcData<UTCTimestamp>[] = [];
  let i = 0;
  while (i < data.length) {
    const candle = data[i];
    if (!candle) {
      break;
    }
    if (out.length > 0) {
      const prev = out[out.length - 1];
      if (!prev) {
        throw new Error('the impossible happened');
      }
      const nextTime = (addDurationWindow(window, new Date(prev.time * 1000)).getTime() /
        1000) as UTCTimestamp;
      if (nextTime < candle.time) {
        out.push({
          time: nextTime,
          open: prev.close,
          close: prev.close,
          low: prev.close,
          high: prev.close,
        });
        continue;
      }
    }
    out.push(candle);
    i += 1;
  }
  return out;
};

export const useCandles = (durationWindow: DurationWindow) => {
  const { baseSymbol, quoteSymbol } = usePathSymbols();

  const query = useQuery({
    queryKey: ['candles', baseSymbol, quoteSymbol, durationWindow],
    queryFn: async (): Promise<OhlcData[]> => {
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
      return insertEmptyCandles(durationWindow, jsonRes);
    },
  });

  useRefetchOnNewBlock(query);

  return query;
};
