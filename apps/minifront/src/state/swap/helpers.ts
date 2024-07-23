import {
  Value,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import {
  CandlestickData,
  SimulateTradeRequest,
  SimulateTradeResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb.js';
import { getAssetId, getDisplay } from '@penumbra-zone/getters/metadata';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  getAmount,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { BigNumber } from 'bignumber.js';
import { SwapSlice } from '.';
import { dexClient, simulationClient } from '../../clients';
import { PriceHistorySlice } from './price-history';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { fromBaseUnitAmount } from '@penumbra-zone/types/amount';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { isKnown } from '../helpers';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';

export const sendSimulateTradeRequest = ({
  assetIn,
  assetOut,
  amount,
}: Pick<SwapSlice, 'assetIn' | 'assetOut' | 'amount'>): Promise<SimulateTradeResponse> => {
  if (!assetIn || !assetOut) {
    throw new Error('Both asset in and out need to be set');
  }

  const swapInValue = new Value({
    assetId: getAssetIdFromValueView(assetIn.balanceView),
    amount: toBaseUnit(
      BigNumber(amount || 0),
      getDisplayDenomExponentFromValueView(assetIn.balanceView),
    ),
  });

  const req = new SimulateTradeRequest({
    input: swapInValue,
    output: getAssetId(assetOut),
  });

  return simulationClient.simulateTrade(req);
};

/**
 * Due to the way price data is recorded, symmetric comparisons do not return
 * symmetric data. to get the complete picture, a client must combine both
 * datasets.
 *  1. query the intended comparison direction (start token -> end token)
 *  2. query the inverse comparison direction (end token -> start token)
 *  3. flip the inverse data (reciprocal values, high becomes low)
 *  4. combine the data (use the highest high, lowest low, sum volumes)
 */
export const sendCandlestickDataRequests = async (
  { startMetadata, endMetadata }: Pick<PriceHistorySlice, 'startMetadata' | 'endMetadata'>,
  limit: bigint,
  signal?: AbortSignal,
): Promise<CandlestickData[]> => {
  const start = startMetadata?.penumbraAssetId;
  const end = endMetadata?.penumbraAssetId;

  if (!start || !end) {
    throw new Error('Asset pair incomplete');
  }
  if (start.equals(end)) {
    throw new Error('Asset pair equivalent');
  }

  const suppressAbort = (err: unknown) => {
    if (!signal?.aborted) {
      throw err;
    }
  };

  const directReq = dexClient
    .candlestickData({ pair: { start, end }, limit }, { signal })
    .catch(suppressAbort);
  const inverseReq = dexClient
    .candlestickData({ pair: { start: end, end: start }, limit }, { signal })
    .catch(suppressAbort);

  const directCandles = (await directReq)?.data ?? [];
  const inverseCandles = (await inverseReq)?.data ?? [];

  // collect candles at each height
  const collatedByHeight = Map.groupBy(
    [
      ...directCandles,
      ...inverseCandles.map(
        // flip inverse data to match orientation of direct data
        inverseCandle => {
          const correctedCandle = inverseCandle.clone();
          // comparative values are reciprocal
          correctedCandle.open = 1 / inverseCandle.open;
          correctedCandle.close = 1 / inverseCandle.close;
          // high and low swap places
          correctedCandle.high = 1 / inverseCandle.low;
          correctedCandle.low = 1 / inverseCandle.high;
          return correctedCandle;
        },
      ),
    ],
    ({ height }) => height,
  );

  // combine data at each height into a single candle
  const combinedCandles = Array.from(collatedByHeight.entries()).map(
    ([height, candlesAtHeight]) => {
      // TODO: open/close don't diverge much, and when they do it seems to be due
      // to inadequate number precision. it might be better to just pick one, but
      // it's not clear which one is 'correct'
      const combinedCandleAtHeight = candlesAtHeight.reduce((acc, cur) => {
        // sum volumes
        acc.directVolume += cur.directVolume;
        acc.swapVolume += cur.swapVolume;

        // highest high, lowest low
        acc.high = Math.max(acc.high, cur.high);
        acc.low = Math.min(acc.low, cur.low);

        // these accumulate to be averaged
        acc.open += cur.open;
        acc.close += cur.close;
        return acc;
      }, new CandlestickData({ height }));

      // average accumulated open/close
      combinedCandleAtHeight.open /= candlesAtHeight.length;
      combinedCandleAtHeight.close /= candlesAtHeight.length;

      return combinedCandleAtHeight;
    },
  );

  return combinedCandles.sort((a, b) => Number(a.height - b.height));
};

const byBalanceDescending = (a: BalancesResponse, b: BalancesResponse) => {
  const aExponent = getDisplayDenomExponentFromValueView(a.balanceView);
  const bExponent = getDisplayDenomExponentFromValueView(b.balanceView);
  const aAmount = fromBaseUnitAmount(getAmount(a.balanceView), aExponent);
  const bAmount = fromBaseUnitAmount(getAmount(b.balanceView), bExponent);

  return bAmount.comparedTo(aAmount);
};

const nonSwappableAssetPatterns = [
  assetPatterns.lpNft,
  assetPatterns.proposalNft,
  assetPatterns.votingReceipt,
  assetPatterns.auctionNft,
  assetPatterns.lpNft,

  // In theory, these asset types are swappable, but we have removed them for now to get a better UX
  assetPatterns.delegationToken,
  assetPatterns.unbondingToken,
];

const isSwappable = (metadata: Metadata) =>
  nonSwappableAssetPatterns.every(pattern => !pattern.matches(getDisplay(metadata)));

export const swappableBalancesResponsesSelector = (
  zQueryState: AbridgedZQueryState<BalancesResponse[]>,
) => ({
  loading: zQueryState.loading,
  error: zQueryState.error,
  data: zQueryState.data
    ?.filter(isKnown)
    .filter(balance => isSwappable(getMetadata(balance.balanceView)))
    .sort(byBalanceDescending),
});

export const swappableAssetsSelector = (zQueryState: AbridgedZQueryState<Metadata[]>) => ({
  loading: zQueryState.loading,
  error: zQueryState.error,
  data: zQueryState.data?.filter(isSwappable),
});
