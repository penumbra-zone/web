import { clearCacheHandler } from './routes/clear-cache';
import { connectHandler } from './routes/connect';
import { isConnectedHandler } from './routes/is-connected';
import { pingHandler } from './routes/ping';
import { syncBlocksHandler } from './routes/sync';

import {
  AwaitedResponse,
  IncomingRequest,
  ServicesInterface,
  ServiceWorkerRequest,
  ServiceWorkerResponse,
  SwRequestMessage,
  SwResponse,
} from '@penumbra-zone/types';

// The standard, non-grpc router
export const stdRouter = (
  req: ServiceWorkerRequest<SwRequestMessage>,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
  services: ServicesInterface,
) => {
  (async function () {
    const result = await typedMessageRouter(req.penumbraSwReq, services, sender);

    sendResponse({
      sequence: req.sequence,
      penumbraSwRes: {
        type: req.penumbraSwReq.type,
        data: result,
      } as AwaitedResponse<SwRequestMessage>,
    });
  })().catch(e => {
    sendResponse({
      sequence: req.sequence,
      penumbraSwError: String(e),
    });
  });

  // Returning true indicates to chrome that the response will be sent asynchronously
  return true;
};

// The router that matches the requests with their handlers
const typedMessageRouter = async (
  req: IncomingRequest<SwRequestMessage>,
  services: ServicesInterface,
  sender: chrome.runtime.MessageSender,
): Promise<SwResponse> => {
  switch (req.type) {
    case 'SYNC_BLOCKS':
      return syncBlocksHandler(services)();
    case 'PING':
      return pingHandler(req.arg);
    case 'CLEAR_CACHE':
      return clearCacheHandler(services)();
    case 'CONNECT':
      return connectHandler(services, sender)();
    case 'IS_CONNECTED':
      return isConnectedHandler(sender)();
    default:
      throw new Error(`Unhandled request type: ${JSON.stringify(req)}`);
  }
};
