import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { DbCandle } from '@/shared/api/server/candles/types.ts';
import { addDurationWindow, DurationWindow } from '@/shared/utils/duration.ts';

export const dbCandleToOhlc = (c: DbCandle): OhlcData<UTCTimestamp> => {
  return {
    close: c.close,
    high: c.high,
    low: c.low,
    open: c.open,
    time: (c.start_time.getTime() / 1000) as UTCTimestamp,
  };
};

/** Insert empty candles so that every timestamp as one candle. */
export const insertEmptyCandles = (
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

      let nextTime = (addDurationWindow(window, new Date(prev.time * 1000)).getTime() /
        1000) as UTCTimestamp;

      // Ensure we don't go backwards in time
      if (nextTime <= prev.time) {
        i += 1;
        continue;
      }

      while (nextTime < candle.time) {
        // Ensure we're not adding a candle before the previous one
        if (nextTime > prev.time) {
          out.push({
            time: nextTime,
            open: prev.close,
            close: prev.close,
            low: prev.close,
            high: prev.close,
          });
        }
        nextTime = (addDurationWindow(window, new Date(nextTime * 1000)).getTime() /
          1000) as UTCTimestamp;
      }
    }

    out.push(candle);
    i += 1;
  }

  return out;
};
