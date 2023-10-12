import { ServiceType } from '@bufbuild/protobuf';
import { isDappGrpcRequest, isDappGrpcResponse } from './types';
import { createEventTransport } from './create';
import { backOff } from 'exponential-backoff';

export const createExtInternalEventTransport = <S extends ServiceType>(s: S) => {
  proxyMessages();
  return createEventTransport(s);
};

// Meant as a bridge between the window and chrome runtime
// Required for content scripts
export const proxyMessages = () => {
  // Outgoing window messages converted to chrome runtime messages
  window.addEventListener('message', ({ data }) => {
    if (isDappGrpcRequest(data)) {
      // Service worker can take time to boot up
      // This requires us to retry requests on initial requests or after idle periods
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
