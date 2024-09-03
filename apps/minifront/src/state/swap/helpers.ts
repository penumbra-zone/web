import { Value, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  CandlestickData,
  CandlestickDataResponse,
  SimulateTradeRequest,
  SimulateTradeResponse,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { getAssetId, getDisplay } from '@penumbra-zone/getters/metadata';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { BigNumber } from 'bignumber.js';
import { SwapSlice } from '.';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { isKnown } from '../helpers';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { penumbra } from '../../prax';
import { DexService, SimulationService } from '@penumbra-zone/protobuf';
import { sortByPriorityScore } from '../../fetchers/balances/by-priority-score.ts';

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

  return penumbra.service(SimulationService).simulateTrade(req);
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
export const sendComplementaryCandlestickDataRequests = async (
  startMetadata?: Metadata,
  endMetadata?: Metadata,
  limit?: bigint,
  startHeight?: bigint,
) =>
  Promise.all([
    sendCandlestickDataRequest(startMetadata, endMetadata, limit, startHeight),
    sendCandlestickDataRequest(endMetadata, startMetadata, limit, startHeight),
  ]).then(([direct, inverse]) => ({ direct, inverse }));

export const sendCandlestickDataRequest = async (
  startMetadata?: Metadata,
  endMetadata?: Metadata,
  limit?: bigint,
  startHeight?: bigint,
): Promise<CandlestickDataResponse> => {
  const start = startMetadata?.penumbraAssetId;
  const end = endMetadata?.penumbraAssetId;

  if (!start || !end) {
    throw new Error('Asset pair incomplete');
  }
  if (start.equals(end)) {
    throw new Error('Asset pair equivalent');
  }

  return penumbra.service(DexService).candlestickData({ pair: { start, end }, limit, startHeight });
};

export const combinedCandlestickDataSelector = (
  zQueryState: AbridgedZQueryState<{
    direct: CandlestickDataResponse;
    inverse: CandlestickDataResponse;
  }>,
) => {
  if (!zQueryState.data) {
    return { ...zQueryState, data: undefined };
  } else {
    const direct = zQueryState.data.direct.data;
    const corrected = zQueryState.data.inverse.data.map(
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
    );

    // combine data at each height into a single candle
    const combinedCandles = Array.from(
      // collect candles at each height
      Map.groupBy([...direct, ...corrected], ({ height }) => height),
    ).map(([height, candlesAtHeight]) => {
      // TODO: open/close don't diverge much, and when they do it seems to be due
      // to inadequate number precision. it might be better to just pick one, but
      // it's not clear which one is 'correct'
      const combinedCandleAtHeight = candlesAtHeight.reduce(
        (acc, cur) => {
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
        },
        new CandlestickData({ height, low: Infinity, high: -Infinity }),
      );

      // average accumulated open/close
      combinedCandleAtHeight.open /= candlesAtHeight.length;
      combinedCandleAtHeight.close /= candlesAtHeight.length;

      return combinedCandleAtHeight;
    });

    return {
      ...zQueryState,
      data: combinedCandles.sort((a, b) => Number(a.height - b.height)),
    };
  }
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
    .sort(sortByPriorityScore),
});

export const swappableAssetsSelector = (zQueryState: AbridgedZQueryState<Metadata[]>) => ({
  loading: zQueryState.loading,
  error: zQueryState.error,
  data: zQueryState.data?.filter(isSwappable),
});
