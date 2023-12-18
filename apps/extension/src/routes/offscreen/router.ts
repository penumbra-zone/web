import { InternalRequest } from '@penumbra-zone/types/src/internal-msg/shared';
import { buildActionHandler } from './build';
import {
  ActionBuildMessage,
  OffscreenRequest,
  OffscreenResponse,
  isOffscreenRequest,
} from './types';

export const offscreenMessageHandler = (
  req: InternalRequest<ActionBuildMessage>,
  _: chrome.runtime.MessageSender,
  sendResponse: (x: OffscreenResponse) => void,
) => {
  if (!isOffscreenRequest(req)) return false;

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

const typedMessageRouter = (
  req: OffscreenRequest,
  sendResponse: (x: OffscreenResponse) => void,
) => {
  buildActionHandler(req.request, sendResponse);
};

chrome.runtime.onMessage.addListener(offscreenMessageHandler);
