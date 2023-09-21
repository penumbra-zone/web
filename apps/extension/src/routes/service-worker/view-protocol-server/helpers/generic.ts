import {
  DappMessageRequest,
  ErrorResponse,
  GrpcRequest,
  GrpcResponse,
  isDappGrpcRequest,
  OUTGOING_GRPC_MESSAGE,
} from 'penumbra-transport';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';

export type ViewProtocolReq = DappMessageRequest<
  typeof ViewProtocolService,
  GrpcRequest<typeof ViewProtocolService>
>;

export type ViewProtocolRes = GrpcResponse<typeof ViewProtocolService>;

export const isViewServerReq = (message: unknown): message is ViewProtocolReq => {
  return isDappGrpcRequest(message) && message.serviceTypeName === ViewProtocolService.typeName;
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
