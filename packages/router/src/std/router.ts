import { clearCacheHandler } from './routes/clear-cache';
import { syncBlocksHandler } from './routes/sync';

import {
  IncomingRequest,
  ServicesInterface,
  ServiceWorkerRequest,
  ServiceWorkerResponse,
  SwRequestMessage,
  SwResponse,
} from '@penumbra-zone/types';
import { AwaitedInternalResponse } from '@penumbra-zone/types/src/internal-msg/shared';

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
      } as AwaitedInternalResponse<SwRequestMessage>,
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
    case 'CLEAR_CACHE':
      return clearCacheHandler(services)();
    default:
      throw new Error(`Unhandled request type: ${JSON.stringify(req)}`);
  }
};
