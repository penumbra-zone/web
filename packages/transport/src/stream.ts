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

type PromiseResolver<T> = (value: T | PromiseLike<T>) => void;

class Looper {
  private resolver: PromiseResolver<void> | undefined;

  sleep(resolver: PromiseResolver<void>) {
    this.resolver = resolver;
  }

  processRequest() {
    if (this.resolver) {
      this.resolver();
      this.resolver = undefined;
    }
  }
}

// Adds yield generator requests to `pending` storage and matches them with their responses
export const serverStreamIO = async function* <S extends ServiceType, M extends GrpcRequest<S>>(
  pending: PendingRequests<S>,
  requestMethod: M,
  serviceTypeName: S['typeName'],
): AsyncGenerator<GrpcResponse<S>> {
  const sequence = ++pending.sequence;
  const queue = new Array<DappMessageResponse<S>>();

  const looper = new Looper();

  pending.requests.set(sequence, {
    resolve: m => {
      queue.push(m);
      looper.processRequest();
    },
    reject: m => {
      queue.push(m);
      looper.processRequest();
    },
  });

  window.postMessage({
    type: INCOMING_GRPC_MESSAGE,
    sequence,
    requestMethod,
    requestTypeName: requestMethod.getType().typeName,
    serviceTypeName,
  } satisfies DappMessageRequest<S, M>);

  while (true) {
    if (!queue.length) {
      await new Promise(resolve => {
        looper.sleep(resolve);
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
