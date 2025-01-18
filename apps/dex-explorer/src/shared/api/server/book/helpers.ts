import { Registry } from '@penumbra-labs/registry';
import BigNumber from 'bignumber.js';
import {
  SimulateTradeResponse,
  SwapExecution_Trace,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Trace, TraceIndex } from '@/shared/api/server/book/types.ts';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { Value, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { formatAmount } from '@penumbra-zone/types/amount';
import { removeTrailingZeros } from '@penumbra-zone/types/shortify';

// Build an index for this trace based on the price and the hops.
// The index is a concatenation of the price and the asset IDs of each hops.
const computeTraceIndex = (trace: Trace): TraceIndex => {
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

export const buildTrace = (
  trace: SwapExecution_Trace,
  registry: Registry,
  quote_to_base: boolean,
): Trace => {
  // First, we record the first and last hops.
  const firstHop = trace.value[0];
  const lastHop = trace.value[trace.value.length - 1];

  // Then, we determine which is the base and quote asset.
  // Remember, the sell side is built by simulating from quote to base,
  // and the buy side is built by going from base to quote.
  const baseValue = quote_to_base ? lastHop : firstHop;
  const quoteValue = quote_to_base ? firstHop : lastHop;

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

  const price = new BigNumber(formattedQuoteAmount)
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
  quote_to_base: quote_to_base = false,
}: {
  res: SimulateTradeResponse;
  registry: Registry;
  limit: number;
  quote_to_base?: boolean;
}): Trace[] => {
  const tracesByPrice = new Map<TraceIndex, Trace>();

  // We consolidate the traces by price and number of hops.
  // This allows us to aggregate the amount available at each price point, while
  // differentiating between single and multi-hop entries in the route book.
  for (const t of res.output?.traces ?? []) {
    const trace = buildTrace(t, registry, quote_to_base);
    // Compute a unique index based on the price and the hops for this trace.
    const index = computeTraceIndex(trace);

    // Check if a previous trace is already stored for this index.
    const storedTrace = tracesByPrice.get(index); /* by reference */
    // If we have a hit, we update the aggregated amount.
    if (storedTrace) {
      const newAmount = new BigNumber(storedTrace.amount).plus(trace.amount);
      storedTrace.amount = newAmount.toString();
    } else {
      // Otherwise, we store the trace.
      tracesByPrice.set(index, trace);
    }
  }

  // Now that we have an aggregated amount for each price point, we sort the traces by price (ascending).
  const sortedTraces = Array.from(tracesByPrice.values()).sort((a, b) => {
    const priceA = new BigNumber(a.price);
    const priceB = new BigNumber(b.price);
    return priceA.comparedTo(priceB);
  });

  // If we are going from quote to base, we want to get the lowest prices first in ascending order.
  // Otherwise, we want to get the highest prices first, ordered in descending order.
  const traces = quote_to_base
    ? sortedTraces.slice(0, limit)
    : sortedTraces.slice(-limit).reverse();

  let cumulativeTotal = new BigNumber(0);
  // We want to return a collection of ordered traces, along with the cumulative amount of
  // inventory available at each price point (from the tip).
  return quote_to_base
    ? traces
        .map(trace => {
          cumulativeTotal = cumulativeTotal.plus(trace.amount);
          return {
            ...trace,
            total: removeTrailingZeros(cumulativeTotal.toString()),
          };
        })
        .reverse()
    : traces.map(trace => {
        cumulativeTotal = cumulativeTotal.plus(trace.amount);
        return {
          ...trace,
          total: removeTrailingZeros(cumulativeTotal.toString()),
        };
      });
};
