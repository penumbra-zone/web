import { clearCacheHandler } from './routes/clear-cache';
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
} from 'penumbra-types';

// The standard, non-grpc router
export const stdRouter = (
  req: ServiceWorkerRequest<SwRequestMessage>,
  sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
  services: ServicesInterface,
) => {
  (async function () {
    const result = await typedMessageRouter(req.penumbraSwReq, services);
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
