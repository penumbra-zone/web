import { ServiceWorkerResponse } from './extension/types';
import { extRouter, isExtRequest, SwRequestMessage } from './extension/router';
import { isViewServerReq } from './view-protocol-server/helpers/generic';
import { viewServerRouter } from './view-protocol-server/router';

// Used to filter for service worker messages and narrow their type to pass to the typed handler.
// Exposed to service worker for listening for internal and external messages
export const swMessageHandler = (
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
) => {
  if (isExtRequest(message)) {
    return extRouter(message, sendResponse);
  } else if (isViewServerReq(message)) {
    viewServerRouter(message, sender);
  }
  return;
};
