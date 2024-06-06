import { Value } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapSlice } from '.';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
} from '@penumbra-zone/getters/value-view';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import { BigNumber } from 'bignumber.js';
import {
  CandlestickData,
  SimulateTradeRequest,
  SimulateTradeResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { simulationClient, dexClient } from '../../clients';
import { getAssetIdFromBalancesResponseOptional } from '@penumbra-zone/getters/balances-response';

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
  { assetIn, assetOut }: Pick<SwapSlice, 'assetIn' | 'assetOut'>,
  {
    limit,
    startHeight,
  }: {
    limit?: bigint;
    startHeight?: bigint;
  },
  signal?: AbortSignal,
): Promise<CandlestickData[] | undefined> => {
  if (!assetIn || !assetOut) return;
  const start = getAssetIdFromBalancesResponseOptional(assetIn);
  const end = assetOut.penumbraAssetId;

  const { data } = await dexClient.candlestickData(
    {
      pair: { start, end },
      limit,
      startHeight,
    },
    { signal },
  );

  return data;
};
