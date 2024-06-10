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
