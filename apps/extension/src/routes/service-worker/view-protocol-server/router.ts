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
import { handleTransactionInfoReq, isTransactionInfoRequest } from './transaction-info';
import { handleStatusReq, isStatusStreamRequest } from './status-stream';
import { handleAssetsReq, isAssetsRequest } from './assets';

// Router for ViewService
export const viewServerRouter = (req: ViewProtocolReq, sender: chrome.runtime.MessageSender) => {
  const send = getTransport(sender);
  const msg = deserializeReq(req);

  (async function () {
    if (isStreamingMethod(req)) {
      for await (const result of streamingHandler(msg)) {
        await send(streamResponse(req, { value: result, done: false }));
      }
      await send(streamResponse(req, { done: true }));
    } else {
      const result = await unaryHandler(msg);
      await send(unaryResponse(req, result));
    }
  })().catch(e => {
    void send(errorResponse(req, e));
  });
};

// If from dapp, send to tab
// If internal message, send via chrome.runtime
const getTransport = (
  sender: chrome.runtime.MessageSender,
): ((res: unknown) => Promise<unknown>) => {
  if (sender.tab?.id) {
    return (res: unknown) => chrome.tabs.sendMessage(sender.tab!.id!, res); // Guaranteed given request is from dapp
  } else {
    return (res: unknown) => chrome.runtime.sendMessage(sender.id, res);
  }
};

const unaryHandler = async (msg: ViewReqMessage): Promise<ViewProtocolRes> => {
  if (isAppParamsRequest(msg)) return handleAppParamsReq();

  throw new Error(`Non-supported unary request: ${msg.getType().typeName}`);
};

const streamingHandler = (msg: ViewReqMessage): AsyncIterable<ViewProtocolRes> => {
  if (isBalancesRequest(msg)) return handleBalancesReq(msg);
  else if (isTransactionInfoRequest(msg)) return handleTransactionInfoReq(msg);
  else if (isStatusStreamRequest(msg)) return handleStatusReq(msg);
  else if (isAssetsRequest(msg)) return handleAssetsReq(msg);

  throw new Error(`Non-supported streaming request: ${msg.getType().typeName}`);
};
