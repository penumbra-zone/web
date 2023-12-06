import {
  NullifierStatusRequest,
  NullifierStatusResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';
import { assertWalletIdMatches } from './utils';

export const isNullifierStatusRequest = (req: ViewReqMessage): req is NullifierStatusRequest => {
  return req.getType().typeName === NullifierStatusRequest.typeName;
};

export const handleNullifierStatusReq = async (
  req: NullifierStatusRequest,
  services: ServicesInterface,
): Promise<NullifierStatusResponse> => {
  await assertWalletIdMatches(req.walletId);

  const { indexedDb } = await services.getWalletServices();
  if (!req.nullifier) return new NullifierStatusResponse();

  // TODO req.awaitDetection processing

  const noteByNullifier = await indexedDb.getNoteByNullifier(req.nullifier);
  const swapByNullifier = await indexedDb.getSwapByNullifier(req.nullifier);

  if (noteByNullifier) {
    if (noteByNullifier.heightSpent) return new NullifierStatusResponse({ spent: true });
    else return new NullifierStatusResponse({ spent: false });
  } else if (swapByNullifier) {
    if (swapByNullifier.heightClaimed) return new NullifierStatusResponse({ spent: true });
    else return new NullifierStatusResponse({ spent: false });
  } else return new NullifierStatusResponse();
};
