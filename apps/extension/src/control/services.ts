import { ServicesInterface } from '@penumbra-zone/types/src/services';
import { InternalMessage, InternalRequest, InternalResponse } from './internal-message';

type ServicesControlMessage = SyncBlocksMessage | ClearCacheMessage;
type SyncBlocksMessage = InternalMessage<'SYNC_BLOCKS', undefined, true>;
type ClearCacheMessage = InternalMessage<'CLEAR_CACHE', undefined, true>;

const isServicesControlRequest = (
  message: unknown,
): message is InternalRequest<ServicesControlMessage> =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  (message.type === 'SYNC_BLOCKS' || message.type === 'CLEAR_CACHE');

const sendServicesControlRequest = async <M extends ServicesControlMessage>(
  message: InternalRequest<M>,
) => {
  const response = await chrome.runtime.sendMessage<InternalRequest<M>, InternalResponse<M>>(
    message,
  );
  if ('error' in response) throw new Error(String(response.error));
};

export const servicesControlHandler =
  (services: ServicesInterface) =>
  (
    message: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (res: InternalResponse<ServicesControlMessage>) => void,
  ) => {
    if (sender.id !== chrome.runtime.id) return; // unhandled
    if (!isServicesControlRequest(message)) return; // unhandled
    const { type } = message;
    let action;
    switch (type) {
      case 'CLEAR_CACHE':
        action = services.clearCache();
        break;
      case 'SYNC_BLOCKS':
        action = services.tryToSync();
        break;
    }
    action.then(
      () => sendResponse({ type, data: true }),
      (error: unknown) => sendResponse({ type, error: `${type} failed: ${String(error)}` }),
    );
    return true; // async handler
  };

export const blockCacheControl = {
  syncBlocks: () => sendServicesControlRequest({ type: 'SYNC_BLOCKS', request: undefined }),
  clearCache: () => sendServicesControlRequest({ type: 'CLEAR_CACHE', request: undefined }),
};
