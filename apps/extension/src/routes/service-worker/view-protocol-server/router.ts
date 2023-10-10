import { handleBalancesReq, isBalancesRequest } from './balances';
import { handleAppParamsReq, isAppParamsRequest } from './app-params';
import {
  deserializeReq,
  errorResponse,
  ViewProtocolReq,
  ViewProtocolRes,
  ViewReqMessage,
} from './helpers/generic';
import { isStreamingMethod, streamResponse } from './helpers/streaming';
import { unaryResponse } from './helpers/unary';
import { services } from '../../../service-worker';
import { handleTransactionInfoReq, isTransactionInfoRequest } from './transaction-info';

export const viewServerRouter = (req: ViewProtocolReq, sender: chrome.runtime.MessageSender) => {
  const id = sender.tab!.id!; // Guaranteed given request is from dapp
  const msg = deserializeReq(req);

  (async function () {
    if (isStreamingMethod(req)) {
      for await (const result of streamingHandler(msg)) {
        await chrome.tabs.sendMessage(id, streamResponse(req, { value: result, done: false }));
      }
      await chrome.tabs.sendMessage(id, streamResponse(req, { done: true }));
    } else {
      const result = await unaryHandler(msg);
      await chrome.tabs.sendMessage(id, unaryResponse(req, result));
    }
  })().catch(e => {
    void chrome.tabs.sendMessage(id, errorResponse(req, e));
  });
};

const unaryHandler = async (msg: ViewReqMessage): Promise<ViewProtocolRes> => {
  if (isAppParamsRequest(msg)) {
    return handleAppParamsReq();
  }
  throw new Error(`Non-supported unary request: ${msg.getType().typeName}`);
};

const streamingHandler = (msg: ViewReqMessage): AsyncIterable<ViewProtocolRes> => {
  if (isBalancesRequest(msg)) {
    return handleBalancesReq(msg, services.indexedDb);
  } else if (isTransactionInfoRequest(msg)) {
    return handleTransactionInfoReq(msg, services.indexedDb);
  }
  throw new Error(`Non-supported streaming request: ${msg.getType().typeName}`);
};
