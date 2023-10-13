import { simulateClient } from '../clients/grpc';
import { SimulateTradeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1alpha1/dex_pb';
import { Base64Str, base64ToUint8Array, splitLoHi } from 'penumbra-types';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { useQuery } from '@tanstack/react-query';
import { testnetConstants } from 'penumbra-constants';

interface ValueProps {
  inputAsset: Base64Str;
  amount: number;
  outputAsset: Base64Str;
}

export const useSimulateTrade = ({ inputAsset, amount, outputAsset }: ValueProps) => {
  return useQuery({
    queryKey: ['simulate-trade', inputAsset, amount, outputAsset],
    queryFn: () => simulateTrade(inputAsset, amount, outputAsset),
  });
};

export const useSimulateTrades = (props: ValueProps[]) => {
  return useQuery({
    queryKey: ['simulate-trades', props],
    queryFn: () => {
      const allTrades = props.map(p => simulateTrade(p.inputAsset, p.amount, p.outputAsset));
      return Promise.all(allTrades);
    },
  });
};

export const useUsdcValues = (props: Omit<ValueProps, 'outputAsset'>[]) => {
  const withUsdc = props.map(p => ({
    inputAsset: p.inputAsset,
    amount: p.amount,
    outputAsset: testnetConstants.usdcAssetId,
  }));
  return useSimulateTrades(withUsdc);
};

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
