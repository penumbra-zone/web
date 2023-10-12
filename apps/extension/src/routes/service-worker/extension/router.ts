import {
  AwaitedResponse,
  IncomingRequest,
  ServiceWorkerRequest,
  ServiceWorkerResponse,
  SwResponse,
} from './types';
import { syncBlocksHandler, SyncBlocksMessage } from './sync';
import { pingHandler, PingMessage } from './ping';

// Narrows message to ensure it's one intended for service worker
export const isExtRequest = (
  message: unknown,
): message is ServiceWorkerRequest<SwRequestMessage> => {
  return typeof message === 'object' && message !== null && 'penumbraSwReq' in message;
};

export const extRouter = (
  req: ServiceWorkerRequest<SwRequestMessage>,
  sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
) => {
  (async function () {
    const result = await typedMessageRouter(req.penumbraSwReq);
    sendResponse({
      penumbraSwRes: {
        type: req.penumbraSwReq.type,
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

// List all service worker messages here
export type SwRequestMessage = SyncBlocksMessage | PingMessage;

// The router that matches the requests with their handlers
const typedMessageRouter = async (req: IncomingRequest<SwRequestMessage>): Promise<SwResponse> => {
  switch (req.type) {
    case 'SYNC_BLOCKS':
      return syncBlocksHandler();
    case 'PING':
      return pingHandler(req.arg);
    default:
      throw new Error(`Unhandled request type: ${JSON.stringify(req)}`);
  }
};
