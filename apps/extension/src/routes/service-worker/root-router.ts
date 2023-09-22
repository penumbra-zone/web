import { ServiceWorkerResponse } from './internal/types';
import { internalRouter, isInternalRequest, SwRequestMessage } from './internal/router';
import { isViewServerReq, viewServerRouter } from './view-protocol-server/router';

// Used to filter for service worker messages and narrow their type to pass to the typed handler.
// Exposed to service worker for listening for internal and external messages
export const swMessageHandler = (
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
) => {
  if (isInternalRequest(message)) {
    return internalRouter(message, sendResponse);
  } else if (isViewServerReq(message)) {
    viewServerRouter(message, sender);
    return;
  } else {
    return;
  }
};
