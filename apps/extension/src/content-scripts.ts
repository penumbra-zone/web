import { isDappGrpcRequest, isDappGrpcResponse } from 'penumbra-transport';

// Meant to proxy requests between dapp and extension

const sendMsg = async (data: unknown) => {
  try {
    await chrome.runtime.sendMessage(data);
  } catch (error) {
    console.log(error);
    await sendMsg(data);
  }
};

window.addEventListener('message', ({ data }) => {
  if (isDappGrpcRequest(data)) {
    void (async () => await sendMsg(data))();
  }
});

chrome.runtime.onMessage.addListener(message => {
  if (isDappGrpcResponse(message)) {
    window.postMessage(message);
  }
});
