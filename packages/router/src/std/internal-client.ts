import {
  AwaitedResponse,
  ClearCacheMessage,
  ConnectMessage,
  IncomingRequest,
  IsConnectedMessage,
  PingMessage,
  ServiceWorkerRequest,
  ServiceWorkerResponse,
  SwRequestMessage,
  SyncBlocksMessage,
} from '@penumbra-zone/types';

export const internalSwClient = {
  syncBlocks: () => sendSwMessage<SyncBlocksMessage>({ type: 'SYNC_BLOCKS' }),
  ping: (arg: string) => sendSwMessage<PingMessage>({ type: 'PING', arg }),
  clearCache: () => sendSwMessage<ClearCacheMessage>({ type: 'CLEAR_CACHE' }),
  connect: () => sendSwMessage<ConnectMessage>({ type: 'CONNECT' }),
  isConnected: () => sendSwMessage<IsConnectedMessage>({ type: 'IS_CONNECTED' }),
};

export const sendSwMessage = async <T extends SwRequestMessage>(
  req: IncomingRequest<T>,
): Promise<AwaitedResponse<T>['data']> => {
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
