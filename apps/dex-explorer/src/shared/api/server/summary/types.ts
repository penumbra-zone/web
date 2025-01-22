import { DurationWindow } from '@/shared/utils/duration.ts';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DexExPairsSummary } from '@/shared/database/schema';
import { calculateDisplayPrice, calculateEquivalentInUSDC } from '@/shared/utils/price-conversion';
import { round } from '@penumbra-zone/types/round';
import { toValueView } from '@/shared/utils/value-view';

const priceDiffLabel = (num: number): ChangeData['sign'] => {
  if (num === 0) {
    return 'neutral';
  }
  if (num > 0) {
    return 'positive';
  }
  return 'negative';
};

export interface ChangeData {
  sign: 'positive' | 'negative' | 'neutral';
  value: number;
  percent: string;
}

export interface SummaryData {
  baseAsset: Metadata;
  quoteAsset: Metadata;
  liquidity: ValueView;
  window: DurationWindow;
  directVolume: ValueView;
  price: number;
  high: number;
  low: number;
  change: ChangeData;
  candles?: number[];
  candleTimes?: Date[];
}

export const adaptSummary = (
  summary: DexExPairsSummary,
  baseAsset: Metadata,
  quoteAsset: Metadata,
  usdc: Metadata,
  candles?: number[],
  candleTimes?: Date[],
): SummaryData => {
  let liquidity = toValueView({
    amount: Math.floor(summary.liquidity),
    metadata: quoteAsset,
  });

  const directVolume = toValueView({
    amount: Math.floor(summary.direct_volume_indexing_denom_over_window),
    metadata: usdc,
  });

  // Converts liquidity and trading volume to their equivalent USDC prices if `usdc_price` is available
  if (summary.usdc_price) {
    liquidity = calculateEquivalentInUSDC(summary.liquidity, summary.usdc_price, quoteAsset, usdc);
  }

  const priceDiff = summary.price - summary.price_then;
  const change = {
    value: calculateDisplayPrice(priceDiff, baseAsset, quoteAsset),
    sign: priceDiffLabel(priceDiff),
    percent:
      summary.price === 0
        ? '0'
        : round({
            value: Math.abs(((summary.price - summary.price_then) / summary.price_then) * 100),
            decimals: 2,
          }),
  };

  return {
    window: summary.the_window,
    price: calculateDisplayPrice(summary.price, baseAsset, quoteAsset),
    high: calculateDisplayPrice(summary.high, baseAsset, quoteAsset),
    low: calculateDisplayPrice(summary.low, baseAsset, quoteAsset),
    baseAsset,
    quoteAsset,
    change,
    liquidity,
    directVolume,
    candles,
    candleTimes,
  };
};

export interface NoSummaryData {
  window: DurationWindow;
  noData: true;
}

export type SummaryResponse = SummaryData | NoSummaryData | { error: string };
