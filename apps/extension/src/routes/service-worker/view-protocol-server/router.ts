import { handleBalancesReq, isBalancesRequest } from './balances';
import { handleChainParamsReq, isChainParamsRequest } from './chain-params';
import { errorResponse, ViewProtocolReq, ViewProtocolRes } from './helpers/generic';
import { isStreamingMethod, streamResponse } from './helpers/streaming';
import { unaryResponse } from './helpers/unary';
import { services } from '../../../service-worker';

export const viewServerRouter = (req: ViewProtocolReq, sender: chrome.runtime.MessageSender) => {
  const id = sender.tab!.id!; // Guaranteed given request is from dapp

  (async function () {
    if (isStreamingMethod(req)) {
      for await (const result of streamingHandler(req)) {
        await chrome.tabs.sendMessage(id, streamResponse(req, { value: result, done: false }));
      }
      await chrome.tabs.sendMessage(id, streamResponse(req, { done: true }));
    } else {
      const result = await unaryHandler(req);
      await chrome.tabs.sendMessage(id, unaryResponse(req, result));
    }
  })().catch(e => {
    void chrome.tabs.sendMessage(id, errorResponse(req, e));
  });
};

const unaryHandler = async (req: ViewProtocolReq): Promise<ViewProtocolRes> => {
  if (isChainParamsRequest(req)) {
    return handleChainParamsReq();
  }
  throw new Error(`Non-supported unary request: ${req.requestMethod.getType().typeName}`);
};

const streamingHandler = (req: ViewProtocolReq): AsyncIterable<ViewProtocolRes> => {
  if (isBalancesRequest(req)) {
    return handleBalancesReq(req, services.controllers.indexedDb);
  }
  throw new Error(`Non-supported streaming request: ${req.requestMethod.getType().typeName}`);
};
