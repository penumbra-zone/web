import {
  ClearCacheMessage,
  IncomingRequest,
  ServiceWorkerRequest,
  ServiceWorkerResponse,
  SwRequestMessage,
} from '@penumbra-zone/types';
import { AwaitedInternalResponse } from '@penumbra-zone/types/src/internal-msg/shared';

export const internalSwClient = {
  clearCache: () => sendSwMessage<ClearCacheMessage>({ type: 'CLEAR_CACHE' }),
};

export const sendSwMessage = async <T extends SwRequestMessage>(
  req: IncomingRequest<T>,
): Promise<AwaitedInternalResponse<T>['data']> => {
  const res = await chrome.runtime.sendMessage<ServiceWorkerRequest<T>, ServiceWorkerResponse<T>>({
    penumbraSwReq: req,
    sequence: 10000000000000, // Not used internally
  });
  if ('penumbraSwRes' in res) {
    return res.penumbraSwRes.data;
  } else {
    throw new Error(res.penumbraSwError);
  }
};
