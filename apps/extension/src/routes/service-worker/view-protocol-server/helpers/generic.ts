import {
  DappMessageRequest,
  errorResponseMsg,
  GrpcRequest,
  GrpcResponse,
  isDappGrpcRequest,
  streamResponseMsg,
  unaryResponseMsg,
} from 'penumbra-transport';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { ServiceType } from '@bufbuild/protobuf';
import { MethodKind } from '@bufbuild/protobuf/dist/cjs/service-type';
import { ServiceWorkerResponse } from '../../internal/types';
import { SwRequestMessage } from '../../internal/router';

export type ViewReqMessage = GrpcRequest<typeof ViewProtocolService>;
export type ViewProtocolRes = GrpcResponse<typeof ViewProtocolService>;

export const isViewServerReq = (
  message: unknown,
): message is DappMessageRequest<typeof ViewProtocolService> => {
  return isDappGrpcRequest(message) && message.serviceTypeName === ViewProtocolService.typeName;
};

interface MethodMatch<S extends ServiceType> {
  msg: GrpcRequest<S>;
  kind: MethodKind;
}

// Over the wire, gRPC requests must be serialized to JSON. This deserializes to the original message.
export const deserializeReq = <S extends ServiceType>(
  req: DappMessageRequest<S>,
  service: S,
): MethodMatch<S> => {
  const match = Object.values(service.methods).find(m => m.I.typeName === req.requestTypeName);
  if (!match)
    throw new Error(`Cannot find corresponding request method for ${req.requestTypeName}`);
  return {
    msg: match.I.fromJson(req.jsonReq) as GrpcRequest<S>,
    kind: match.kind,
  };
};

export const createServerRoute =
  <S extends ServiceType>(
    service: S,
    unaryHandler: UnaryHandler<S>,
    streamingHandler: StreamingHandler<S>,
  ) =>
  (
    req: DappMessageRequest<S>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ServiceWorkerResponse<SwRequestMessage>) => void,
  ) => {
    const send = getTransport(sender);
    const { msg, kind } = deserializeReq(req, service);

    (async function () {
      if (kind === MethodKind.ServerStreaming) {
        for await (const result of streamingHandler(msg)) {
          await send(streamResponseMsg(req, { value: result, done: false }));
        }
        await send(streamResponseMsg(req, { done: true }));
      } else if (kind === MethodKind.Unary) {
        const result = await unaryHandler(msg);
        await send(unaryResponseMsg(req, result));
      } else {
        throw new Error(`Method kind: ${kind}, not supported`);
      }
    })().catch(e => {
      void send(errorResponseMsg(req, e));
    });
  };

// If from dapp, send to tab
// If internal message, send via chrome.runtime
export const getTransport = (
  sender: chrome.runtime.MessageSender,
): ((res: unknown) => Promise<unknown>) => {
  if (sender.tab?.id) {
    return (res: unknown) => chrome.tabs.sendMessage(sender.tab!.id!, res); // Guaranteed given request is from dapp
  } else {
    return (res: unknown) => chrome.runtime.sendMessage(sender.id, res);
  }
};

export type UnaryHandler<S extends ServiceType> = (msg: GrpcRequest<S>) => Promise<GrpcResponse<S>>;

export type StreamingHandler<S extends ServiceType> = (
  msg: GrpcRequest<S>,
) => AsyncIterable<GrpcResponse<S>>;
