import { OhlcData, UTCTimestamp } from 'lightweight-charts';
import { DbCandle } from '@/shared/api/server/candles/types.ts';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

export const dbCandleToOhlc = (c: DbCandle): OhlcData => {
  return {
    close: c.close,
    high: c.high,
    low: c.low,
    open: c.open,
    time: (c.start_time.getTime() / 1000) as UTCTimestamp,
  };
};

const mergeCandle = (candle1: DbCandle, candle2: DbCandle): DbCandle => {
  const mergedCandle = { ...candle1 };

  // OHLC should be weighted average
  const candle1TotalVolume = candle1.swap_volume + candle1.direct_volume;
  const candle2TotalVolume = candle2.swap_volume + candle2.direct_volume;

  mergedCandle.open =
    (candle1.open * candle1TotalVolume + candle2.open * candle2TotalVolume) /
    (candle1TotalVolume + candle2TotalVolume);
  mergedCandle.close =
    (candle1.close * candle1TotalVolume + candle2.close * candle2TotalVolume) /
    (candle1TotalVolume + candle2TotalVolume);

  mergedCandle.high = Math.max(candle1.high, candle2.high);
  mergedCandle.low = Math.min(candle1.low, candle2.low);

  mergedCandle.swap_volume = candle1.swap_volume + candle2.swap_volume;
  mergedCandle.direct_volume = candle1.direct_volume + candle2.direct_volume;

  return mergedCandle;
};

interface CandleSet {
  metadata: Metadata;
  candles: DbCandle[];
}

// Should be reversed to be in terms of base asset
const normalizeQuoteCandles = (base: CandleSet, quote: CandleSet): DbCandle[] => {
  const baseExponent = getDisplayDenomExponent(base.metadata);
  const quoteExponent = getDisplayDenomExponent(quote.metadata);
  return quote.candles.map(prevCandle => {
    const candle = { ...prevCandle };
    candle.open = 1 / candle.open;
    candle.close = 1 / candle.close;
    candle.high = 1 / candle.high;
    candle.low = 1 / candle.low;

    // TODO: Adjust volumes based on price? But what price???
    candle.swap_volume =
      (candle.swap_volume * (1 / candle.close)) / 10 ** Math.abs(baseExponent - quoteExponent);
    candle.direct_volume =
      (candle.direct_volume * (1 / candle.close)) / 10 ** Math.abs(baseExponent - quoteExponent);

    return candle;
  });
};

export const mergeCandles = (base: CandleSet, quote: CandleSet): DbCandle[] => {
  // If theres any data at the same height, combine them
  const combinedDataMap = new Map<number, DbCandle>();
  base.candles.forEach(candle => {
    combinedDataMap.set(candle.start_time.getTime(), candle);
  });

  normalizeQuoteCandles(base, quote).forEach(candle => {
    const utcTime = candle.start_time.getTime();
    const entry = combinedDataMap.get(utcTime);
    if (entry) {
      const combinedCandle = mergeCandle(entry, candle);
      combinedDataMap.set(utcTime, combinedCandle);
    } else {
      combinedDataMap.set(utcTime, candle);
    }
  });

  const sortedCandles = Array.from(combinedDataMap.values()).sort((a, b) =>
    a.start_time > b.start_time ? 1 : -1,
  );

  return sortedCandles;
};
