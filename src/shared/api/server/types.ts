import { DurationWindow } from '@/shared/utils/duration.ts';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import type { JsonValue } from '@bufbuild/protobuf';

export interface ChangeData {
  sign: 'positive' | 'negative' | 'neutral';
  value: number;
  percent: string;
}

export interface SummaryDataResponseJson {
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
  price: number;
  high: number;
  low: number;
  change: ChangeData;

  constructor({
    window,
    directVolume,
    price,
    high,
    low,
    change,
  }: {
    window: DurationWindow;
    directVolume: ValueView;
    price: number;
    high: number;
    low: number;
    change: ChangeData;
  }) {
    this.window = window;
    this.directVolume = directVolume;
    this.price = price;
    this.high = high;
    this.low = low;
    this.change = change;
  }

  toJson(): SummaryDataResponseJson {
    return {
      window: this.window,
      directVolume: this.directVolume.toJson(),
      price: this.price,
      high: this.high,
      low: this.low,
      change: this.change,
    };
  }

  static fromJson(json: SummaryDataResponseJson): SummaryDataResponse {
    return new SummaryDataResponse({
      window: json.window,
      directVolume: ValueView.fromJson(json.directVolume),
      price: json.price,
      high: json.high,
      low: json.low,
      change: json.change,
    });
  }
}

export interface NoSummaryData {
  window: DurationWindow;
  noData: true;
}

export type SummaryResponse = SummaryDataResponseJson | NoSummaryData | { error: string };
