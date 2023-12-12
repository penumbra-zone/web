import { DappMessageRequest, GrpcRequest, GrpcResponse } from '../transport-old';
import { MethodKind, ServiceType } from '@bufbuild/protobuf';
import { ServicesInterface } from '@penumbra-zone/types';

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
    resolve: (res: unknown) => void,
    reject: (res: unknown) => void,
    services: ServicesInterface,
  ) => {
    const { msg, kind } = deserializeReq(req, service);
    void (async function () {
      if (kind === MethodKind.Unary) return await unaryHandler(msg, services);
      else if (kind === MethodKind.ServerStreaming) return streamingHandler(msg, services);
      else throw new Error(`Method kind: ${kind}, not supported`);
    })()
      .then(resolve)
      .catch(reject);
  };
