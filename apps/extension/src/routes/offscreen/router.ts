import { InternalRequest } from '@penumbra-zone/types/src/internal-msg/shared';
import { buildActionHandler } from './build';
import { ActionBuildMessage, OffscreenRequest, OffscreenResponse } from './types';
import { isOffscreenRequest } from './offscreen';
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { typeRegistry } from '@penumbra-zone/types/src/registry';

export const offscreenMessageHandler = (
  req: InternalRequest<ActionBuildMessage>,
  _: chrome.runtime.MessageSender,
  sendResponse: (x: OffscreenResponse) => void,
) => {
  console.log("Entered offscreenMessageHandler!")
  console.log("req after: ", req.request.transactionPlan!)

  if (!isOffscreenRequest(req)) return false;

  try {
    console.log("req in router: ", req)
    typedMessageRouter(req, sendResponse);
  } catch (e) {
    const response = {
      type: req.type,
      error: String(e),
    } as OffscreenResponse;
    sendResponse(response);
  }

  // Returning true indicates to chrome that the response will be sent asynchronously
  return true;
};

const typedMessageRouter = (
  req: OffscreenRequest,
  sendResponse: (x: OffscreenResponse) => void,
) => {
  console.log("Entered typedMessageRouter!")
  buildActionHandler(req.request, sendResponse);
};