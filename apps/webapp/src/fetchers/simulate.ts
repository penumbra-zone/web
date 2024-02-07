import { simulateClient } from '../clients/grpc';
import { SimulateTradeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { base64ToUint8Array, splitLoHi } from '@penumbra-zone/types';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

// @ts-expect-error Waiting to use when we implement pricing on the assets table
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const simulateTrade = async (inputAsset: string, amount: number, outputAsset: string) => {
  const inputAssetId = base64ToUint8Array(inputAsset);

  const req = new SimulateTradeRequest({
    input: {
      assetId: new AssetId({ inner: inputAssetId }),
      amount: new Amount(splitLoHi(BigInt(amount))),
    },
    output: new AssetId({ inner: base64ToUint8Array(outputAsset) }),
  });
  const res = await simulateClient.simulateTrade(req);
  return res.output!;
};
