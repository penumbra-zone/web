import {
  DappMessageRequest,
  GrpcRequest,
  isDappGrpcRequest,
  isDappGrpcResponse,
} from 'penumbra-transport';
import { backOff } from 'exponential-backoff';
import { ServiceType } from '@bufbuild/protobuf';

// Meant to proxy requests between dapp and extension

window.addEventListener('message', ({ data }) => {
  if (isDappGrpcRequest(data)) {
    void sendMessageWithRetries(data);
  }
});

chrome.runtime.onMessage.addListener(message => {
  if (isDappGrpcResponse(message)) {
    window.postMessage(message);
  }
});

const sendMessageWithRetries = async <S extends ServiceType>(
  data: DappMessageRequest<S, GrpcRequest<S>>,
) => {
  try {
    await backOff(() => chrome.runtime.sendMessage(data), {
      retry: error => {
        console.warn('Errored out, retrying:', error);
        return true;
      },
    });
  } catch (e) {
    console.log('No bueno:', e);
  }
};
