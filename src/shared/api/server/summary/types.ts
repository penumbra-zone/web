import { DurationWindow } from '@/shared/utils/duration.ts';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import type { JsonValue } from '@bufbuild/protobuf';
import { DexExPairsSummary } from '@/shared/database/schema';
import { calculateDisplayPrice } from '@/shared/utils/price-conversion';
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

export interface SummaryDataResponseJson {
  baseAsset: JsonValue;
  quoteAsset: JsonValue;
  liquidity: JsonValue;
  window: DurationWindow;
  directVolume: JsonValue;
  price: number;
  high: number;
  low: number;
  change: ChangeData;
}

export class SummaryDataResponse {
  window: DurationWindow;
  directVolume: ValueView;
  liquidity: ValueView;
  baseAsset: Metadata;
  quoteAsset: Metadata;
  price: number;
  high: number;
  low: number;
  change: ChangeData;

  constructor({
    window,
    directVolume,
    liquidity,
    price,
    high,
    low,
    change,
    baseAsset,
    quoteAsset,
  }: {
    window: DurationWindow;
    directVolume: ValueView;
    liquidity: ValueView;
    price: number;
    high: number;
    low: number;
    change: ChangeData;
    baseAsset: Metadata;
    quoteAsset: Metadata;
  }) {
    this.window = window;
    this.directVolume = directVolume;
    this.liquidity = liquidity;
    this.price = price;
    this.high = high;
    this.low = low;
    this.change = change;
    this.baseAsset = baseAsset;
    this.quoteAsset = quoteAsset;
  }

  static build(
    summary: DexExPairsSummary,
    baseAsset: Metadata,
    quoteAsset: Metadata,
  ): SummaryDataResponse {
    const directVolume = toValueView({
      amount: summary.direct_volume_over_window,
      metadata: quoteAsset,
    });

    const liquidity = toValueView({
      amount: summary.liquidity,
      metadata: quoteAsset,
    });

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

    return new SummaryDataResponse({
      window: summary.the_window,
      price: calculateDisplayPrice(summary.price, baseAsset, quoteAsset),
      high: calculateDisplayPrice(summary.high, baseAsset, quoteAsset),
      low: calculateDisplayPrice(summary.low, baseAsset, quoteAsset),
      baseAsset,
      quoteAsset,
      change,
      liquidity,
      directVolume,
    });
  }

  toJson(): SummaryDataResponseJson {
    return {
      directVolume: this.directVolume.toJson(),
      baseAsset: this.baseAsset.toJson(),
      quoteAsset: this.quoteAsset.toJson(),
      liquidity: this.liquidity.toJson(),
      window: this.window,
      price: this.price,
      high: this.high,
      low: this.low,
      change: this.change,
    };
  }

  static fromJson(json: SummaryDataResponseJson): SummaryDataResponse {
    return new SummaryDataResponse({
      window: json.window,
      price: json.price,
      high: json.high,
      low: json.low,
      change: json.change,
      directVolume: ValueView.fromJson(json.directVolume),
      liquidity: ValueView.fromJson(json.liquidity),
      baseAsset: Metadata.fromJson(json.baseAsset),
      quoteAsset: Metadata.fromJson(json.quoteAsset),
    });
  }
}

export interface NoSummaryData {
  window: DurationWindow;
  noData: true;
}

export type SummaryResponse = SummaryDataResponseJson | NoSummaryData | { error: string };
