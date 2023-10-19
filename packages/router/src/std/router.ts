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
import { ServicesInterface } from 'penumbra-types';

// Narrows message to ensure it's one intended for service worker
export const isStdRequest = (
  message: unknown,
): message is ServiceWorkerRequest<SwRequestMessage> => {
  return typeof message === 'object' && message !== null && 'penumbraSwReq' in message;
};

// The standard, non-grpc router
export const stdRouter = (
  req: ServiceWorkerRequest<SwRequestMessage>,
  sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
  services: ServicesInterface,
) => {
  (async function () {
    const result = await typedMessageRouter(req.penumbraSwReq, services);
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
const typedMessageRouter = async (
  req: IncomingRequest<SwRequestMessage>,
  services: ServicesInterface,
): Promise<SwResponse> => {
  switch (req.type) {
    case 'SYNC_BLOCKS':
      return syncBlocksHandler(services)();
    case 'PING':
      return pingHandler(req.arg);
    case 'CLEAR_CACHE':
      return clearCacheHandler(services)();
    default:
      throw new Error(`Unhandled request type: ${JSON.stringify(req)}`);
  }
};
