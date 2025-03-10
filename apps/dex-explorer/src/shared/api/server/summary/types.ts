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
  const directVolume = toValueView({
    amount: Math.max(Math.floor(summary.direct_volume_indexing_denom_over_window), 0.0),
    metadata: usdc,
  });

  // Converts liquidity and trading volume to their equivalent USDC prices if `usdc_price` is available
  const rawLiquidity = Math.max(Math.floor(summary.liquidity), 0.0);
  let liquidity: ValueView;
  if (summary.usdc_price) {
    liquidity = calculateEquivalentInUSDC(rawLiquidity, summary.usdc_price, quoteAsset, usdc);
  } else {
    liquidity = toValueView({
      amount: Math.max(Math.floor(rawLiquidity), 0.0),
      metadata: quoteAsset,
    });
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
