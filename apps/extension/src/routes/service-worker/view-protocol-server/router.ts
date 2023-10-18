import { deserializeReq, errorResponse, ViewProtocolRes, ViewReqMessage } from './helpers/generic';
import { isStreamingMethod, streamResponse } from './helpers/streaming';
import { unaryResponse } from './helpers/unary';
import {
  DappMessageRequest,
  GrpcRequest,
  GrpcRequestTypename,
  GrpcResponse,
} from 'penumbra-transport';
import { MethodKind, ServiceType } from '@bufbuild/protobuf';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { handleAppParamsReq, isAppParamsRequest } from './app-params';
import { handleAddressReq, isAddressRequest } from './address';
import { handleWalletIdReq, isWalletIdRequest } from './wallet-id';
import { handleTxInfoByHashReq, isTxInfoByHashRequest } from './tx-info-by-hash';
import { handleTxPlannerReq, isTxPlannerRequest } from './tx-planner';
import { handleBalancesReq, isBalancesRequest } from './balances';
import { handleTransactionInfoReq, isTransactionInfoRequest } from './tx-info';
import { handleStatusReq, isStatusStreamRequest } from './status-stream';
import { handleAssetsReq, isAssetsRequest } from './assets';

export const createServerRoute =
  <S extends ServiceType>(
    service: S,
    unaryHandler: UnaryHandler<S>,
    streamingHandler: StreamingHandler<S>,
    streamingMethods: GrpcRequestTypename<S>[],
  ) =>
  (req: DappMessageRequest<S>, sender: chrome.runtime.MessageSender) => {
    const send = getTransport(sender);
    const msg = deserializeReq(req, service);

    (async function () {
      if (isStreamingMethod(req, streamingMethods)) {
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

const streamingMethods: GrpcRequestTypename<typeof ViewProtocolService>[] = Object.values(
  ViewProtocolService.methods,
)
  .filter(m => m.kind === MethodKind.ServerStreaming)
  .map(m => m.I.typeName);

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

export type UnaryHandler<S extends ServiceType> = (msg: GrpcRequest<S>) => Promise<GrpcResponse<S>>;

export const viewServerUnaryHandler: UnaryHandler<typeof ViewProtocolService> = async (
  msg: GrpcRequest<typeof ViewProtocolService>,
): Promise<GrpcResponse<typeof ViewProtocolService>> => {
  if (isAppParamsRequest(msg)) return handleAppParamsReq();
  else if (isAddressRequest(msg)) return handleAddressReq(msg);
  else if (isWalletIdRequest(msg)) return handleWalletIdReq();
  else if (isTxInfoByHashRequest(msg)) return handleTxInfoByHashReq(msg);
  else if (isTxPlannerRequest(msg)) return handleTxPlannerReq(msg);

  throw new Error(`Non-supported unary request: ${(msg as ViewReqMessage).getType().typeName}`);
};

export type StreamingHandler<S extends ServiceType> = (
  msg: GrpcRequest<S>,
) => AsyncIterable<GrpcResponse<S>>;

export const viewServerStreamingHandler = (msg: ViewReqMessage): AsyncIterable<ViewProtocolRes> => {
  if (isBalancesRequest(msg)) return handleBalancesReq(msg);
  else if (isTransactionInfoRequest(msg)) return handleTransactionInfoReq(msg);
  else if (isStatusStreamRequest(msg)) return handleStatusReq(msg);
  else if (isAssetsRequest(msg)) return handleAssetsReq(msg);

  throw new Error(`Non-supported streaming request: ${msg.getType().typeName}`);
};

export const viewServerRouter = createServerRoute(
  ViewProtocolService,
  viewServerUnaryHandler,
  viewServerStreamingHandler,
  streamingMethods,
);
