import { simulateClient } from '../clients/grpc';
import { SimulateTradeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { getAmountFromValueView, getAssetId, getAssetIdFromValueView } from '@penumbra-zone/types';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export const simulateSwapOutput = async (
  assetIn: ValueView,
  assetOut: Metadata,
): Promise<ValueView> => {
  const req = new SimulateTradeRequest({
    input: {
      assetId: getAssetIdFromValueView(assetIn),
      amount: getAmountFromValueView(assetIn),
    },
    output: getAssetId(assetOut),
  });
  const { output } = await simulateClient.simulateTrade(req);
  if (!output?.output) throw new Error('no output of swap simulation');

  return new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: output.output.amount,
        metadata: assetOut,
      },
    },
  });
};
