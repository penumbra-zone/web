import { isDappGrpcRequest, isDappGrpcResponse } from 'penumbra-transport';
import { backOff } from 'exponential-backoff';

// Meant to proxy requests between dapp and extension

window.addEventListener('message', ({ data }) => {
  if (isDappGrpcRequest(data)) {
    console.log('message from dapp', data);
    // Service worker can take time to boot up
    // This requires us to retry requests on initial requests or after idle periods
    void backOff(() => chrome.runtime.sendMessage(data));
  }
});

chrome.runtime.onMessage.addListener(message => {
  if (isDappGrpcResponse(message)) {
    console.log('message from ext', message);
    window.postMessage(message);
  }
});
