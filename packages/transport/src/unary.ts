// A single request/response handler
import { ServiceType } from '@bufbuild/protobuf';
import {
  DappMessageRequest,
  DappMessageResponse,
  GrpcRequest,
  GrpcResponse,
  INCOMING_GRPC_MESSAGE,
  isErrorResponse,
  isResultResponse,
  PendingRequests,
} from './types';
import { Code, ConnectError } from '@connectrpc/connect';

export const unaryIO = async <S extends ServiceType, M extends GrpcRequest<S>>(
  pending: PendingRequests<S>,
  requestMethod: M,
  serviceTypeName: S['typeName'],
): Promise<GrpcResponse<S>> => {
  const sequence = ++pending.sequence;
  const promiseResponse = new Promise<DappMessageResponse<S>>((resolve, reject) => {
    pending.requests.set(sequence, { resolve, reject });
  });
  window.postMessage({
    type: INCOMING_GRPC_MESSAGE,
    sequence,
    requestMethod,
    requestTypeName: requestMethod.getType().typeName,
    serviceTypeName,
  } satisfies DappMessageRequest<S, M>);
  const res = await promiseResponse;
  if (isResultResponse(res)) {
    return res.result;
  } else if (isErrorResponse(res)) {
    throw new ConnectError(res.error);
  } else {
    throw new ConnectError('Other response types not handled', Code.Unimplemented);
  }
};
