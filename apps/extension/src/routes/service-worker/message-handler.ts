import { SwRequestMessage, typedMessageRouter } from './router';
import { AwaitedResponse, ServiceWorkerRequest, ServiceWorkerResponse } from './types';

// Narrows message to ensure it's one intended for service worker
const isSwRequest = (message: unknown): message is ServiceWorkerRequest<SwRequestMessage> => {
  return typeof message === 'object' && message !== null && 'penumbraSwReq' in message;
};

// Used to filter for service worker messages and narrow their type to pass to the typed handler
// Exposed to service worker for listening for messages:
//    chrome.runtime.onMessage.addListener(swMessageHandler);
export const swMessageHandler = (
  message: unknown,
  _: chrome.runtime.MessageSender,
  sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
) => {
  if (!isSwRequest(message)) return;

  (async function () {
    const result = await typedMessageRouter(message.penumbraSwReq);
    sendResponse({
      penumbraSwRes: {
        type: message.penumbraSwReq.type,
        data: result,
      } as AwaitedResponse<SwRequestMessage>,
    });
  })().catch(e => {
    sendResponse({
      penumbraSwError: String(e),
    });
  });

  // Returning true indicates to chrome that the response will be sent asynchronously
  return true;
};
