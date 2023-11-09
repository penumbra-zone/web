import { useBalancesByAccountIndex } from './balances';
import { uint8ArrayToBase64 } from '@penumbra-zone/types';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { sendSelector } from '../state/send';
import { useStore } from '../state';

export const useSendBalance = () => {
  const { asset } = useStore(sendSelector);
  const { data } = useBalancesByAccountIndex();

  const match = data.find(i => uint8ArrayToBase64(i.assetId.inner) === asset.penumbraAssetId.inner);
  return match?.amount ?? new Amount();
};
