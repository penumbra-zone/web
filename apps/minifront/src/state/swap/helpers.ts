import { Value } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  CandlestickData,
  SimulateTradeRequest,
  SimulateTradeResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
} from '@penumbra-zone/getters/value-view';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { BigNumber } from 'bignumber.js';
import { SwapSlice } from '.';
import { dexClient, simulationClient } from '../../clients';
import { PriceHistorySlice } from './price-history';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { getAmount, getMetadata } from '@penumbra-zone/getters/value-view';
import { fromBaseUnitAmount } from '@penumbra-zone/types/amount';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { getValueViewCaseFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';

export const sendSimulateTradeRequest = ({
  assetIn,
  assetOut,
  amount,
}: Pick<SwapSlice, 'assetIn' | 'assetOut' | 'amount'>): Promise<SimulateTradeResponse> => {
  if (!assetIn || !assetOut) throw new Error('Both asset in and out need to be set');

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

export const sendCandlestickDataRequest = async (
  { startMetadata, endMetadata }: Pick<PriceHistorySlice, 'startMetadata' | 'endMetadata'>,
  limit: bigint,
  signal?: AbortSignal,
): Promise<CandlestickData[] | undefined> => {
  const start = startMetadata?.penumbraAssetId;
  const end = endMetadata?.penumbraAssetId;

  if (!start || !end) throw new Error('Asset pair incomplete');
  if (start.equals(end)) throw new Error('Asset pair equivalent');

  try {
    const { data } = await dexClient.candlestickData(
      {
        pair: { start, end },
        limit,
      },
      { signal },
    );
    return data;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    else throw err;
  }
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

const isKnown = (balancesResponse: BalancesResponse) =>
  getValueViewCaseFromBalancesResponse.optional()(balancesResponse) === 'knownAssetId';

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
