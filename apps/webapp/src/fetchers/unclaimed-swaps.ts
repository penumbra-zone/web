import { viewClient } from '../clients';
import { streamToPromise } from './stream';
import { getUnclaimedSwaps } from '@penumbra-zone/getters';
import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const fetchUnclaimedSwaps = async (): Promise<SwapRecord[]> => {
  const responses = await streamToPromise(viewClient.unclaimedSwaps({}));
  return responses.map(getUnclaimedSwaps);
};
