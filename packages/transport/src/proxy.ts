import { ServiceType } from '@bufbuild/protobuf';
import { backOff } from 'exponential-backoff';
import { createEventTransport } from './create';
import { isDappGrpcRequest, isDappGrpcResponse } from './types';

export const createExtInternalEventTransport = <S extends ServiceType>(s: S) => {
  proxyMessages();
  return createEventTransport(s);
};

// Meant as a bridge between the window and chrome runtime
// Required for content scripts
export const proxyMessages = () => {
  // Outgoing window messages converted to chrome runtime messages
  window.addEventListener('message', ({ data }) => {
    if (allowedRequest(data)) {
      // Service worker can take time to boot up
      // This requires us to retry requests on initial requests or after idle periods
      // TODO: Only retry when there is a connection issue
      void backOff(() => chrome.runtime.sendMessage(data));
    }
  });

  // Incoming chrome runtime messages converted to window messages
  chrome.runtime.onMessage.addListener(message => {
    if (isDappGrpcResponse(message)) {
      window.postMessage(message);
    }
  });
};

// For external std messages, make sure they are in the allow list
// For internal std messages, they should be called via the internalSwClient
const allowedRequest = (message: unknown): boolean => {
  return isDappGrpcRequest(message);
  // || (isStdRequest(message) && allowedDappMessages.includes(message.penumbraSwReq.type))
};
