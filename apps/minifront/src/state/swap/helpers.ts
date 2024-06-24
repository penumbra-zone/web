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
import { toPlainMessage } from '@bufbuild/protobuf';

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
    if (signal && !signal.aborted) {
      throw err;
    }
  };

  const directReq = dexClient
    .candlestickData(
      {
        pair: { start, end },
        limit,
      },
      { signal },
    )
    .catch(suppressAbort);

  const inverseReq = dexClient
    .candlestickData(
      {
        pair: { start: end, end: start },
        limit,
      },
      { signal },
    )
    .catch(suppressAbort);

  const candlestickData = (await directReq)?.data ?? [];

  const inverseCandlestickData = (await inverseReq)?.data ?? [];

  const collated = Map.groupBy(
    [
      ...candlestickData,
      ...inverseCandlestickData.map(
        cd =>
          new CandlestickData({
            ...toPlainMessage(cd),
            close: 1 / cd.close,
            high: 1 / cd.low,
            low: 1 / cd.high,
            open: 1 / cd.open,
          }),
      ),
    ],
    ({ height }) => height,
  );

  const combined = Array.from(collated.values()).map(([first, extra]) => {
    if (first && extra) {
      return new CandlestickData({
        directVolume: first.directVolume + extra.directVolume,
        swapVolume: first.swapVolume + extra.swapVolume,
        height: first.height,
        open: (first.open + extra.open) / 2,
        close: (first.close + extra.close) / 2,
        high: first.high > extra.high ? first.high : extra.high,
        low: first.low < extra.low ? first.low : extra.low,
      });
    }
    return first!;
  });

  return combined;
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
