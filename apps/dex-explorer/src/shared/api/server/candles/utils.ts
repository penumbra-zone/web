import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { DbCandle } from '@/shared/api/server/candles/types.ts';
import { addDurationWindow, DurationWindow } from '@/shared/utils/duration.ts';

export interface CandleWithVolume {
  ohlc: OhlcData<UTCTimestamp>;
  volume: number;
}

export const dbCandleToOhlc = (c: DbCandle): CandleWithVolume => {
  return {
    ohlc: {
      close: c.close,
      high: c.high,
      low: c.low,
      open: c.open,
      time: (c.start_time.getTime() / 1000) as UTCTimestamp,
    },
    volume: c.direct_volume + c.swap_volume,
  };
};

/** Insert empty candles so that every timestamp as one candle. */
export const insertEmptyCandles = (
  window: DurationWindow,
  data: CandleWithVolume[],
): CandleWithVolume[] => {
  const out: CandleWithVolume[] = [];
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

      let nextTime = (addDurationWindow(window, new Date(prev.ohlc.time * 1000)).getTime() /
        1000) as UTCTimestamp;

      // Ensure we don't go backwards in time
      if (nextTime <= prev.ohlc.time) {
        i += 1;
        continue;
      }

      while (nextTime < candle.ohlc.time) {
        // Ensure we're not adding a candle before the previous one
        if (nextTime > prev.ohlc.time) {
          out.push({
            ohlc: {
              time: nextTime,
              open: prev.ohlc.close,
              close: prev.ohlc.close,
              low: prev.ohlc.close,
              high: prev.ohlc.close,
            },
            volume: 0,
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
