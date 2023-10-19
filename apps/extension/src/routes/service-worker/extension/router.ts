import { ClearCacheMessage, clearCacheHandler } from './clear-cache';
import { OpenWindowMessage, openWindowHandler } from './open-window';
import { PingMessage, pingHandler } from './ping';
import { SyncBlocksMessage, syncBlocksHandler } from './sync';
import {
  AwaitedResponse,
  IncomingRequest,
  ServiceWorkerRequest,
  ServiceWorkerResponse,
  SwResponse,
} from './types';

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
export type SwRequestMessage =
  | SyncBlocksMessage
  | PingMessage
  | ClearCacheMessage
  | OpenWindowMessage;

// The router that matches the requests with their handlers
const typedMessageRouter = async (req: IncomingRequest<SwRequestMessage>): Promise<SwResponse> => {
  switch (req.type) {
    case 'SYNC_BLOCKS':
      return syncBlocksHandler();
    case 'PING':
      return pingHandler(req.arg);
    case 'CLEAR_CACHE':
      return clearCacheHandler();
    case 'OPEN_WINDOW':
      return openWindowHandler();
    default:
      throw new Error(`Unhandled request type: ${JSON.stringify(req)}`);
  }
};
