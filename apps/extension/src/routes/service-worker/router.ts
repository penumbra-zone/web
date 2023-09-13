import { initializeHandler, InitializeMessage } from './handlers/initialize';
import { pingHandler, PingMessage } from './handlers/ping';
import { IncomingRequest, SwResponse } from './types';

// List all service worker messages here
export type SwRequestMessage = InitializeMessage | PingMessage;

// The router that matches the requests with their handlers
export const typedMessageRouter = async (
  req: IncomingRequest<SwRequestMessage>,
): Promise<SwResponse> => {
  switch (req.type) {
    case 'INITIALIZE': {
      return initializeHandler(req.data);
    }
    case 'PING':
      return pingHandler(req.data);
    default:
      throw new Error(`Unhandled request type: ${JSON.stringify(req)}`);
  }
};
