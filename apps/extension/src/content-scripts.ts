import { isDappGrpcRequest, isDappGrpcResponse } from 'penumbra-transport';

// Meant to proxy requests between dapp and extension

window.addEventListener('message', ({ data }) => {
  if (isDappGrpcRequest(data)) {
    void chrome.runtime.sendMessage(data);
  }
});

chrome.runtime.onMessage.addListener(message => {
  if (isDappGrpcResponse(message)) {
    window.postMessage(message);
  }
});
