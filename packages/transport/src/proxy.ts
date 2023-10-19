import { ServiceType } from '@bufbuild/protobuf';
import { createEventTransport } from './create';
import { isDappGrpcRequest, isDappGrpcResponse } from './types';
import {
  allowedDappMessages,
  isServiceWorkerResponse,
  isStdRequest,
  ServiceWorkerRequest,
  ServiceWorkerResponse,
  SwRequestMessage,
} from 'penumbra-types';
import { backOff } from 'exponential-backoff';

export const createExtInternalEventTransport = <S extends ServiceType>(s: S) => {
  proxyMessages();
  return createEventTransport(s);
};

// Meant as a bridge between the window and chrome runtime. Required for content scripts.
// Service worker can take time to boot up, uses `backOff` to retry requests on init or after idle periods
export const proxyMessages = <T extends SwRequestMessage>() => {
  // Outgoing window messages converted to chrome runtime messages
  window.addEventListener('message', ({ data }) => {
    if (allowedRequest(data)) {
      // Std requests can be awaited for a return value
      if (isStdRequest(data)) {
        void (async function () {
          const res = await backOff(() =>
            chrome.runtime.sendMessage<ServiceWorkerRequest<T>, ServiceWorkerResponse<T>>(data),
          );
          window.postMessage(res);
        })();
      } else {
        // Grpc requests emit chrome.runtime messages separately
        void backOff(() => chrome.runtime.sendMessage(data));
      }
    }
  });

  // Incoming chrome runtime messages converted to window messages
  chrome.runtime.onMessage.addListener(message => {
    if (isDappGrpcResponse(message) || isServiceWorkerResponse(message)) {
      window.postMessage(message);
    }
  });
};

// For external std messages, make sure they are in the allow list
// For internal std messages, they should be called via the internalSwClient
const allowedRequest = (message: unknown): boolean => {
  return (
    isDappGrpcRequest(message) ||
    (isStdRequest(message) && allowedDappMessages.includes(message.penumbraSwReq.type))
  );
};
