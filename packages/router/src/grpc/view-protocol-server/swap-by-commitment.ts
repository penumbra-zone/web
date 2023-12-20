import {
  SwapByCommitmentRequest,
  SwapByCommitmentResponse,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';

export const isSwapByCommitmentRequest = (req: ViewReqMessage): req is SwapByCommitmentRequest => {
  return req.getType().typeName === SwapByCommitmentRequest.typeName;
};

export const handleSwapByCommitmentReq = async (
  req: SwapByCommitmentRequest,
  services: ServicesInterface,
): Promise<SwapByCommitmentResponse> => {
  const { indexedDb } = await services.getWalletServices();
  if (!req.swapCommitment) throw new Error('Missing swap commitment in request');

  const swapByCommitment = await indexedDb.getSwapByCommitment(req.swapCommitment);
  if (swapByCommitment) return new SwapByCommitmentResponse({ swap: swapByCommitment });
  if (!req.awaitDetection) throw new Error('Swap not found');

  // Wait until our DB encounters a new swap with this commitment
  const response = new SwapByCommitmentResponse();
  const subscription = indexedDb.subscribe('SWAPS');

  for await (const update of subscription) {
    const swapRecord = SwapRecord.fromJson(update.value);
    if (swapRecord.swapCommitment?.equals(req.swapCommitment)) {
      response.swap = swapRecord;
      break;
    }
  }
  return response;
};
