// A single request/response handler
import { JsonValue, ServiceType } from '@bufbuild/protobuf';
import {
  DappMessageRequest,
  DappMessageResponse,
  GrpcRequest,
  INCOMING_GRPC_MESSAGE,
  isUnaryResponse,
  PendingRequests,
} from './types';
import { ConnectError } from '@connectrpc/connect';

export const unaryIO = async <S extends ServiceType, M extends GrpcRequest<S>>(
  pending: PendingRequests<S>,
  requestMethod: M,
  serviceTypeName: S['typeName'],
): Promise<JsonValue> => {
  const sequence = ++pending.sequence;
  const promiseResponse = new Promise<DappMessageResponse<S>>((resolve, reject) => {
    pending.requests.set(sequence, { resolve, reject });
  });
  window.postMessage({
    type: INCOMING_GRPC_MESSAGE,
    sequence,
    jsonReq: requestMethod.toJson(),
    requestTypeName: requestMethod.getType().typeName,
    serviceTypeName,
  } satisfies DappMessageRequest<S>);
  try {
    const res = await promiseResponse;
    if (isUnaryResponse(res)) {
      return res.result;
    } else {
      throw new Error(`Other response types not handled. Response: ${JSON.stringify(res)}`);
    }
  } catch (e) {
    throw ConnectError.from(JSON.stringify(e));
  }
};
