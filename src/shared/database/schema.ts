// kysely-codegen helped genereate the types for this file

import type { ColumnType } from 'kysely';

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

export type JsonArray = JsonValue[];

/* eslint-disable-next-line -- record cannot be used as it creates circular references */
export interface JsonObject {
  [x: string]: JsonValue | undefined;
}

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface DexExCandlesticks {
  close: number;
  direct_volume: number;
  high: number;
  id: Generated<number>;
  low: number;
  open: number;
  swap_volume: number;
}

export interface DexExPriceCharts {
  asset_end: Buffer;
  asset_start: Buffer;
  candlestick_id: number | null;
  id: Generated<number>;
  start_time: Timestamp;
  the_window: string;
}

export interface DexExSummary {
  asset_end: Buffer;
  asset_start: Buffer;
  current_price: number;
  direct_volume_24h: number;
  high_24h: number;
  low_24h: number;
  price_24h_ago: number;
  swap_volume_24h: number;
}

export interface DB {
  dex_ex_candlesticks: DexExCandlesticks;
  dex_ex_price_charts: DexExPriceCharts;
  dex_ex_summary: DexExSummary;
}
