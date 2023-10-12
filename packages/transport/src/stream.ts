import { ServiceType } from '@bufbuild/protobuf';
import {
  DappMessageRequest,
  DappMessageResponse,
  GrpcRequest,
  GrpcResponse,
  INCOMING_GRPC_MESSAGE,
  isErrorResponse,
  isStreamResponse,
  PendingRequests,
} from './types';
import { ConnectError } from '@connectrpc/connect';
import { Looper } from './looper';

// Adds yield generator requests to `pending` storage and matches them with their responses
export const serverStreamIO = async function* <S extends ServiceType, M extends GrpcRequest<S>>(
  pending: PendingRequests<S>,
  requestMethod: M,
  serviceTypeName: S['typeName'],
): AsyncGenerator<GrpcResponse<S>> {
  const sequence = ++pending.sequence;
  const queue = new Array<DappMessageResponse<S>>();

  const looper = new Looper<void>();

  pending.requests.set(sequence, {
    resolve: m => {
      queue.push(m);
      looper.run();
    },
    reject: m => {
      queue.push(m);
      looper.run();
    },
  });

  window.postMessage({
    type: INCOMING_GRPC_MESSAGE,
    sequence,
    requestTypeName: requestMethod.getType().typeName,
    jsonReq: requestMethod.toJson(),
    serviceTypeName,
  } satisfies DappMessageRequest<S>);

  while (true) {
    if (!queue.length) {
      await new Promise(resolve => {
        looper.set(resolve);
      });
    } else {
      const res = queue.shift()!;
      if (isStreamResponse(res)) {
        if (res.stream.done) {
          break;
        } else {
          yield res.stream.value;
        }
      } else if (isErrorResponse(res)) {
        throw new ConnectError(res.error);
      }
    }
  }
};
