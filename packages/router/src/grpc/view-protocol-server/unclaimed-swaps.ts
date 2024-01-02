import {
  UnclaimedSwapsRequest,
  UnclaimedSwapsResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';
import { assertWalletIdMatches } from './utils';

export const isUnclaimedSwapsRequest = (msg: ViewReqMessage): msg is UnclaimedSwapsRequest => {
  return msg.getType().typeName === UnclaimedSwapsRequest.typeName;
};

export const handleUnclaimedSwapsReq = async function* (
  req: UnclaimedSwapsRequest,
  services: ServicesInterface,
): AsyncIterable<UnclaimedSwapsResponse> {
  await assertWalletIdMatches(req.walletId);

  const { indexedDb } = await services.getWalletServices();
  const allSwaps = await indexedDb.getAllSwaps();

  const responses = allSwaps
    .filter(swap => swap.heightClaimed === 0n)
    .map(swap => new UnclaimedSwapsResponse({ swap }));
  yield* responses;
};
