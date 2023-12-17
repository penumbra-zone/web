import { InternalRequest } from '@penumbra-zone/types/src/internal-msg/shared';
import { buildActionHandler } from './build';
import { ActionBuildMessage, OffscreenMessage, OffscreenRequest, OffscreenResponse, isOffscreenRequest } from './types';

export const offscreenMessageHandler = (
    req: InternalRequest<ActionBuildMessage>,
    _: chrome.runtime.MessageSender,
    sendResponse: (x: unknown) => void,
  ) => {
    if (!isOffscreenRequest(req)) return;

    try {
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

export const isOffscreenApprovalReq = (req: OffscreenRequest): req is OffscreenMessage => {
  return req.type === 'ACTION_AND_BUILD';
};

const typedMessageRouter = (req: OffscreenRequest, sendResponse: (x: unknown) => void): void => {
  if (isOffscreenApprovalReq(req)) buildActionHandler(req.request, sendResponse);;
};

chrome.runtime.onMessage.addListener(offscreenMessageHandler);