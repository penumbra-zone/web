import {
  AwaitedResponse,
  IncomingRequest,
  ServiceWorkerRequest,
  ServiceWorkerResponse,
} from '../types';
import { SyncBlocksMessage } from '../sync';
import { SwRequestMessage } from '../router';
import { PingMessage } from '../ping';

export const swClient = {
  syncBlocks: () => sendSwMessage<SyncBlocksMessage>({ type: 'SYNC_BLOCKS' }),
  ping: (arg: string) => sendSwMessage<PingMessage>({ type: 'PING', arg }),
};

export const sendSwMessage = async <T extends SwRequestMessage>(
  req: IncomingRequest<T>,
): Promise<AwaitedResponse<T>['data']> => {
  const res = await chrome.runtime.sendMessage<ServiceWorkerRequest<T>, ServiceWorkerResponse<T>>({
    penumbraSwReq: req,
  });
  if ('penumbraSwRes' in res) {
    return res.penumbraSwRes.data;
  } else {
    throw new Error(res.penumbraSwError);
  }
};
