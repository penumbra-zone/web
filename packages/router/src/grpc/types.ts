import {
  DappMessageRequest,
  errorResponseMsg,
  GrpcRequest,
  GrpcResponse,
  streamResponseMsg,
  unaryResponseMsg,
} from '@penumbra-zone/transport';
import { MethodKind, ServiceType } from '@bufbuild/protobuf';
import { ServicesInterface } from '@penumbra-zone/types';
import { typeRegistry } from '@penumbra-zone/types/src/registry';

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

export type UnaryHandler<S extends ServiceType> = (
  msg: GrpcRequest<S>,
  services: ServicesInterface,
) => Promise<GrpcResponse<S>>;

export type StreamingHandler<S extends ServiceType> = (
  msg: GrpcRequest<S>,
  services: ServicesInterface,
) => AsyncIterable<GrpcResponse<S>>;

export const createServerRoute =
  <S extends ServiceType>(
    service: S,
    unaryHandler: UnaryHandler<S>,
    streamingHandler: StreamingHandler<S>,
  ) =>
  (
    req: DappMessageRequest<S>,
    sender: chrome.runtime.MessageSender,
    services: ServicesInterface,
  ) => {
    const send = getTransport(sender);
    const { msg, kind } = deserializeReq(req, service);

    (async function () {
      if (kind === MethodKind.ServerStreaming) {
        for await (const result of streamingHandler(msg, services)) {
          await send(streamResponseMsg(req, { value: result, done: false }, typeRegistry));
        }
        await send(streamResponseMsg(req, { done: true }, typeRegistry));
      } else if (kind === MethodKind.Unary) {
        const result = await unaryHandler(msg, services);
        await send(unaryResponseMsg(req, result, typeRegistry));
      } else {
        throw new Error(`Method kind: ${kind}, not supported`);
      }
    })().catch(e => {
      void send(errorResponseMsg(req, e));
    });
  };
