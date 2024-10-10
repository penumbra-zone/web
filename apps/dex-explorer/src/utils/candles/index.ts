import { CandlestickData } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Token } from '@/old/utils/types/token';

export interface VolumeCandle extends CandlestickData {
  volume: number;
}

// Merge the two arrays, forward will be left alone, however backward will need to
// have 1/price and volumes will have to account for the pricing and decimal difference
export function createMergeCandles(asset1Token: Token, asset2Token: Token) {
  function mergeCandle(candle1: CandlestickData, candle2: CandlestickData): VolumeCandle {
    const mergedCandle = { ...candle1 } as VolumeCandle;

    // OHLC should be weighted average
    const candle1TotalVolume = candle1.swapVolume + candle1.directVolume;
    const candle2TotalVolume = candle2.swapVolume + candle2.directVolume;

    mergedCandle.open =
      (candle1.open * candle1TotalVolume + candle2.open * candle2TotalVolume) /
      (candle1TotalVolume + candle2TotalVolume);
    mergedCandle.close =
      (candle1.close * candle1TotalVolume + candle2.close * candle2TotalVolume) /
      (candle1TotalVolume + candle2TotalVolume);

    mergedCandle.high = Math.max(candle1.high, candle2.high);
    mergedCandle.low = Math.min(candle1.low, candle2.low);

    mergedCandle.directVolume = candle1.directVolume + candle2.directVolume;
    mergedCandle.swapVolume = candle1.swapVolume + candle2.swapVolume;
    mergedCandle.volume = candle1TotalVolume + candle2TotalVolume;

    return mergedCandle;
  }

  return function mergeCandles(candles1: CandlestickData[] | undefined, candles2: CandlestickData[] | undefined): VolumeCandle[] {
    if (!candles1?.length || !candles2?.length) {
      return [];
    }

    const normalizedCandles2 = candles2.map((prevCandle: CandlestickData) => {
      const candle = { ...prevCandle };
      candle.open = 1 / candle.open;
      candle.close = 1 / candle.close;
      candle.high = 1 / candle.high;
      candle.low = 1 / candle.low;

      // TODO: Adjust volumes based on price? But what price???
      candle.swapVolume =
        (candle.swapVolume * (1 / candle.close)) /
        10 ** Math.abs(asset2Token.decimals - asset2Token.decimals);
      candle.directVolume =
        (candle.directVolume * (1 / candle.close)) /
        10 ** Math.abs(asset1Token.decimals - asset2Token.decimals);

      return candle;
    }) as CandlestickData[];

    // If theres any data at the same height, combine them
    const combinedDataMap = new Map<bigint, CandlestickData | VolumeCandle>();
    candles1.forEach((candle: CandlestickData) => {
      combinedDataMap.set(candle.height, candle);
    });

    normalizedCandles2.forEach((candle: CandlestickData) => {
      if (combinedDataMap.has(candle.height)) {
        const prevCandle = combinedDataMap.get(candle.height) as CandlestickData;
        const combinedCandle = mergeCandle(prevCandle, candle);
        combinedDataMap.set(candle.height, combinedCandle);
      } else {
        combinedDataMap.set(candle.height, candle);
      }
    });

    const sortedCandles = (Array.from(combinedDataMap.values()) as VolumeCandle[])
      .sort((a, b) => (a.height > b.height ? 1 : -1));

    return sortedCandles;
  };
}
