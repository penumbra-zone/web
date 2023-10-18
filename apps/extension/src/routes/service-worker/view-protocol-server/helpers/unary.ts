import {
  DappMessageRequest,
  GrpcResponse,
  OUTGOING_GRPC_MESSAGE,
  ResultResponse,
} from 'penumbra-transport';
import { ServiceType } from '@bufbuild/protobuf';

export const unaryResponse = <S extends ServiceType>(
  req: DappMessageRequest<S>,
  result: GrpcResponse<S>,
): ResultResponse<S> => {
  return {
    type: OUTGOING_GRPC_MESSAGE,
    sequence: req.sequence,
    requestTypeName: req.requestTypeName,
    serviceTypeName: req.serviceTypeName,
    result,
  };
};
