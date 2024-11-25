import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { DbCandle } from '@/shared/api/server/candles/types.ts';

export const dbCandleToOhlc = (c: DbCandle): OhlcData<UTCTimestamp> => {
  return {
    close: c.close,
    high: c.high,
    low: c.low,
    open: c.open,
    time: (c.start_time.getTime() / 1000) as UTCTimestamp,
  };
};
