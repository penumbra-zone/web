import {
  DappMessageRequest,
  ErrorResponse,
  GrpcRequest,
  GrpcResponse,
  isDappGrpcRequest,
  OUTGOING_GRPC_MESSAGE,
} from 'penumbra-transport';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';

export type ViewProtocolReq = DappMessageRequest<typeof ViewProtocolService>;
export type ViewReqMessage = GrpcRequest<typeof ViewProtocolService>;
export type ViewProtocolRes = GrpcResponse<typeof ViewProtocolService>;

export const isViewServerReq = (message: unknown): message is ViewProtocolReq => {
  return isDappGrpcRequest(message) && message.serviceTypeName === ViewProtocolService.typeName;
};

// Over the wire, gRPC requests must be serialized to JSON. This deserializes to the original message.
export const deserializeReq = (req: ViewProtocolReq): ViewReqMessage => {
  const match = Object.values(ViewProtocolService.methods).find(
    m => m.I.typeName === req.requestTypeName,
  );
  if (!match)
    throw new Error(`Cannot find corresponding request method for ${req.requestTypeName}`);
  return match.I.fromJson(req.jsonReq);
};

export const errorResponse = (
  req: ViewProtocolReq,
  error: unknown,
): ErrorResponse<typeof ViewProtocolService> => {
  return {
    type: OUTGOING_GRPC_MESSAGE,
    sequence: req.sequence,
    requestTypeName: req.requestTypeName,
    serviceTypeName: req.serviceTypeName,
    error: String(error),
  };
};
