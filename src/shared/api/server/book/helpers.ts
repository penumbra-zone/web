import { Registry } from '@penumbra-labs/registry';
import BigNumber from 'bignumber.js';
import {
  SimulateTradeResponse,
  SwapExecution_Trace,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Trace, TraceHash } from '@/shared/api/server/book/types.ts';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { Value, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { formatAmount } from '@penumbra-zone/types/amount';
import { removeTrailingZeros } from '@penumbra-zone/types/shortify';

// Used to aggregate equal prices along the same route
const getTraceHash = (trace: Trace): TraceHash => {
  const hopsHash = trace.hops.map(h => getAssetIdFromValueView(h).toJsonString()).join('-');
  return `${trace.price}-${hopsHash}`;
};

export const getValueView = (registry: Registry, { amount, assetId }: Value) => {
  const metadata = assetId ? registry.tryGetMetadata(assetId) : undefined;
  return new ValueView({
    valueView: metadata
      ? {
          case: 'knownAssetId',
          value: { amount, metadata },
        }
      : {
          case: 'unknownAssetId',
          value: {
            amount,
            assetId,
          },
        },
  });
};

export const getPriceForTrace = (
  trace: SwapExecution_Trace,
  registry: Registry,
  invertPrice: boolean,
): Trace => {
  const baseValue = trace.value[0];
  const quoteValue = trace.value[trace.value.length - 1];

  if (!baseValue?.amount || !quoteValue?.amount || !baseValue.assetId || !quoteValue.assetId) {
    throw new Error('Missing required value fields');
  }

  const baseMetadata = registry.getMetadata(baseValue.assetId);
  const quoteMetadata = registry.getMetadata(quoteValue.assetId);

  const baseDisplayDenomExponent = getDisplayDenomExponent.optional(baseMetadata) ?? 0;
  const quoteDisplayDenomExponent = getDisplayDenomExponent.optional(quoteMetadata) ?? 0;
  const formattedBaseAmount = formatAmount({
    amount: baseValue.amount,
    exponent: baseDisplayDenomExponent,
  });
  const formattedQuoteAmount = formatAmount({
    amount: quoteValue.amount,
    exponent: quoteDisplayDenomExponent,
  });

  const price = invertPrice
    ? // For sell-side, price should be in terms of quote asset
      new BigNumber(formattedBaseAmount)
        .dividedBy(formattedQuoteAmount)
        .toFormat(baseDisplayDenomExponent)
    : // For buy-side, price remains in terms of base asset
      new BigNumber(formattedQuoteAmount)
        .dividedBy(formattedBaseAmount)
        .toFormat(quoteDisplayDenomExponent);

  return {
    price: removeTrailingZeros(price),
    amount: formattedBaseAmount,
    total: 'TBD',
    hops: trace.value.map(v => getValueView(registry, v)),
  };
};

export const processSimulation = ({
  res,
  registry,
  limit,
  invertPrice = false,
}: {
  res: SimulateTradeResponse;
  registry: Registry;
  limit: number;
  invertPrice?: boolean;
}): Trace[] => {
  const priceMap = new Map<TraceHash, Trace>();

  // First: combine traces with same prices
  for (const t of res.output?.traces ?? []) {
    const trace = getPriceForTrace(t, registry, invertPrice);
    const hash = getTraceHash(trace);
    const entry = priceMap.get(hash);
    if (entry) {
      const newAmount = new BigNumber(entry.amount).plus(trace.amount);
      entry.amount = newAmount.toString();
    } else {
      priceMap.set(hash, trace);
    }
  }

  // Second: sort by price
  const sortedTraces = Array.from(priceMap.values()).sort((a, b) => {
    const priceA = new BigNumber(a.price);
    const priceB = new BigNumber(b.price);
    return priceB.comparedTo(priceA);
  });

  // Third: get a portion of the traces array
  // For sell-side, take highest prices (end of array)
  // For buy-side, take lowest prices (start of array)
  const traces = invertPrice ? sortedTraces.slice(-limit) : sortedTraces.slice(0, limit);

  // Fourth: cumulate totals
  let cumulativeTotal = new BigNumber(0);
  return invertPrice
    ? traces
        .toReversed()
        .map(trace => {
          cumulativeTotal = cumulativeTotal.plus(trace.amount);
          return {
            ...trace,
            total: removeTrailingZeros(cumulativeTotal.toString()),
          };
        })
        .toReversed()
    : traces.map(trace => {
        cumulativeTotal = cumulativeTotal.plus(trace.amount);
        return {
          ...trace,
          total: removeTrailingZeros(cumulativeTotal.toString()),
        };
      });
};
