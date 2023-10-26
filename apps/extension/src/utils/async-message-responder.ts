import { ServiceWorkerResponse, SwRequestMessage } from '@penumbra-zone/types';

export function asyncMessageResponder(
  asyncFn: (
    request: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
  ) => Promise<boolean | undefined>,
) {
  return (
    request: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
  ) => {
    void Promise.resolve(asyncFn(request, sender, sendResponse));

    // Indicate that the message will be handled asynchronously.
    return true;
  };
}
