import {
  BuySellTraces,
  BuySellTracesJson,
  RouteBookResponse,
  RouteBookResponseJson,
  Trace,
  TraceJson,
} from '@/shared/api/server/book/types.ts';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const serializeTrace = (trace: Trace): TraceJson => {
  return {
    price: trace.price,
    amount: trace.amount,
    total: trace.total,
    hops: trace.hops.map(v => v.toJson()),
  };
};

export const deserializeTrace = (trace: TraceJson): Trace => {
  return {
    price: trace.price,
    amount: trace.amount,
    total: trace.total,
    hops: trace.hops.map(v => ValueView.fromJson(v)),
  };
};

export const serializeBuySellTraces = (traces: BuySellTraces): BuySellTracesJson => {
  return {
    buy: traces.buy.map(serializeTrace),
    sell: traces.sell.map(serializeTrace),
  };
};

export const deserializeBuySellTraces = (traces: BuySellTracesJson): BuySellTraces => {
  return {
    buy: traces.buy.map(deserializeTrace),
    sell: traces.sell.map(deserializeTrace),
  };
};

export const serializeResponse = ({
  singleHops,
  multiHops,
}: {
  singleHops: BuySellTraces;
  multiHops: BuySellTraces;
}): RouteBookResponseJson => {
  return {
    singleHops: serializeBuySellTraces(singleHops),
    multiHops: serializeBuySellTraces(multiHops),
  };
};

export const deserializeRouteBookResponseJson = ({
  singleHops,
  multiHops,
}: RouteBookResponseJson): RouteBookResponse => {
  return {
    singleHops: deserializeBuySellTraces(singleHops),
    multiHops: deserializeBuySellTraces(multiHops),
  };
};
