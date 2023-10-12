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
  if (!allowedRequest(sender)) return;

  if (isExtRequest(message)) {
    return extRouter(message, sendResponse);
  } else if (isViewServerReq(message)) {
    viewServerRouter(message, sender);
  }
  return;
};

// Protections to guard for allowed messages only. Requirements:
// - TODO: If message from dapp, should only be from sites that have received permission via `connect`
// - If message from extension, ensure it comes from our own and not an external extension
const allowedRequest = (sender: chrome.runtime.MessageSender): boolean => {
  return sender.tab?.id !== undefined || sender.id === chrome.runtime.id;
};
