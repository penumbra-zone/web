import { isOffscreenRequest, OffscreenMessage, OffscreenResponse } from './types';
import { authAndBuildHandler } from './auth-build';
import { AwaitedResponse, IncomingRequest, Responses } from '../service-worker/extension/types';

// Used to filter for service worker messages and narrow their type to pass to the typed handler.
// Exposed to service worker for listening for internal and external messages
export const offscreenMessageHandler = (
  message: unknown,
  _: chrome.runtime.MessageSender,
  sendResponse: (response: OffscreenResponse<OffscreenMessage>) => void,
) => {
  if (!isOffscreenRequest(message)) return;

  (async function () {
    const result = await typedMessageRouter(message.offscreenReq);
    sendResponse({
      penumbraOffscreenRes: {
        type: message.offscreenReq.type,
        data: result,
      } as AwaitedResponse<OffscreenMessage>,
    });
  })().catch(e => {
    sendResponse({
      penumbraOffscreenError: String(e),
    });
  });

  // Returning true indicates to chrome that the response will be sent asynchronously
  return true;
};

// The router that matches the requests with their handlers
const typedMessageRouter = async (
  req: IncomingRequest<OffscreenMessage>,
): Promise<Responses<OffscreenMessage>> => {
  switch (req.type) {
    case 'AUTH_AND_BUILD':
      return authAndBuildHandler(req.arg);
    default:
      throw new Error(`Unhandled request type: ${JSON.stringify(req)}`);
  }
};

chrome.runtime.onMessage.addListener(offscreenMessageHandler);
