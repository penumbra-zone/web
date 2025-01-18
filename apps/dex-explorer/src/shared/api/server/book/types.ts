import { JsonValue } from '@bufbuild/protobuf';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export interface Trace {
  price: string;
  amount: string;
  total: string;
  hops: ValueView[];
}

export type TraceIndex = string;

export interface BuySellTraces {
  buy: Trace[];
  sell: Trace[];
}

export interface RouteBookResponse {
  singleHops: BuySellTraces;
  multiHops: BuySellTraces;
}

export interface TraceJson {
  price: string;
  amount: string;
  total: string;
  hops: JsonValue[];
}

export interface BuySellTracesJson {
  buy: TraceJson[];
  sell: TraceJson[];
}

export interface RouteBookResponseJson {
  singleHops: BuySellTracesJson;
  multiHops: BuySellTracesJson;
}
