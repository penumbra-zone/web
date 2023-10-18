import {
  DappMessageRequest,
  ErrorResponse,
  GrpcRequest,
  GrpcResponse,
  isDappGrpcRequest,
  OUTGOING_GRPC_MESSAGE,
} from 'penumbra-transport';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { ServiceType } from '@bufbuild/protobuf';

export type ViewProtocolReq = DappMessageRequest<typeof ViewProtocolService>;
export type ViewReqMessage = GrpcRequest<typeof ViewProtocolService>;
export type ViewProtocolRes = GrpcResponse<typeof ViewProtocolService>;

export const isViewServerReq = (message: unknown): message is ViewProtocolReq => {
  return isDappGrpcRequest(message) && message.serviceTypeName === ViewProtocolService.typeName;
};

// Over the wire, gRPC requests must be serialized to JSON. This deserializes to the original message.
export const deserializeReq = <S extends ServiceType>(
  req: DappMessageRequest<S>,
  service: S,
): GrpcRequest<S> => {
  const match = Object.values(service.methods).find(m => m.I.typeName === req.requestTypeName);
  if (!match)
    throw new Error(`Cannot find corresponding request method for ${req.requestTypeName}`);
  return match.I.fromJson(req.jsonReq) as GrpcRequest<S>;
};

export const errorResponse = <S extends ServiceType>(
  req: DappMessageRequest<S>,
  error: unknown,
): ErrorResponse<S> => {
  return {
    type: OUTGOING_GRPC_MESSAGE,
    sequence: req.sequence,
    requestTypeName: req.requestTypeName,
    serviceTypeName: req.serviceTypeName,
    error: String(error),
  };
};
