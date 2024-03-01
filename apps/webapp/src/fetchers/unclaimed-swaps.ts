import { viewClient } from '../clients';
import Array from '@penumbra-zone/polyfills/Array.fromAsync';
import { getUnclaimedSwaps } from '@penumbra-zone/getters';
import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const fetchUnclaimedSwaps = async (): Promise<SwapRecord[]> => {
  const responses = await Array.fromAsync(viewClient.unclaimedSwaps({}));
  return responses.map(getUnclaimedSwaps);
};
