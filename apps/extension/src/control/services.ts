import { ServicesInterface } from '@penumbra-zone/types/src/services';
import {
  InternalMessage,
  InternalRequest,
  InternalResponse,
  ServicesMsg,
} from './internal-message';

type ServicesControlMessage = SyncBlocksMessage | ClearCacheMessage;
type SyncBlocksMessage = InternalMessage<ServicesMsg.SyncBlocks, undefined, true>;
type ClearCacheMessage = InternalMessage<ServicesMsg.ClearCache, undefined, true>;

const isServicesControlRequest = (req: unknown): req is InternalRequest<ServicesControlMessage> =>
  typeof req === 'object' &&
  req !== null &&
  'type' in req &&
  typeof req.type === 'string' &&
  req.type in ServicesMsg;

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
      case ServicesMsg.ClearCache:
        action = services.clearCache();
        break;
      case ServicesMsg.SyncBlocks:
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
  syncBlocks: () =>
    sendServicesControlRequest({ type: ServicesMsg.SyncBlocks, request: undefined }),
  clearCache: () =>
    sendServicesControlRequest({ type: ServicesMsg.ClearCache, request: undefined }),
};
