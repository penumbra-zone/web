import { clearCacheHandler, ClearCacheMessage } from './routes/clear-cache';
import { pingHandler, PingMessage } from './routes/ping';
import { syncBlocksHandler, SyncBlocksMessage } from './routes/sync';
import {
  AwaitedResponse,
  IncomingRequest,
  ServiceWorkerRequest,
  ServiceWorkerResponse,
  SwResponse,
} from './types';

// Narrows message to ensure it's one intended for service worker
export const isInternalRequest = (
  message: unknown,
): message is ServiceWorkerRequest<SwRequestMessage> => {
  return typeof message === 'object' && message !== null && 'penumbraSwReq' in message;
};

export const internalRouter = (
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
export type SwRequestMessage = SyncBlocksMessage | PingMessage | ClearCacheMessage;

// The router that matches the requests with their handlers
const typedMessageRouter = async (req: IncomingRequest<SwRequestMessage>): Promise<SwResponse> => {
  switch (req.type) {
    case 'SYNC_BLOCKS':
      return syncBlocksHandler();
    case 'PING':
      return pingHandler(req.arg);
    case 'CLEAR_CACHE':
      return clearCacheHandler();
    default:
      throw new Error(`Unhandled request type: ${JSON.stringify(req)}`);
  }
};
