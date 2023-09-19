// NOTE: Code taken and modified from original: https://github.com/turbocrime/transport-demo

import { createRouterTransport, ServiceImpl } from '@connectrpc/connect';
import { MethodKind, ServiceType } from '@bufbuild/protobuf';
import { Message } from '@bufbuild/protobuf/dist/types/message';
import { MessageType } from '@bufbuild/protobuf/dist/types/message-type';
import {
  CreateAnyImplMethod,
  DappMessageRequest,
  DappMessageResponse,
  GrpcResponse,
  INCOMING_GRPC_MESSAGE,
  isDappGrpcResponse,
  isErrorResponse,
  isResultResponse,
  isStreamResponse,
  PendingRequests,
} from './types';

// Creates a new service implementation by wrapping the original with the special event transport methods
const makeAnyServiceImpl = <T extends ServiceType>(
  service: ServiceType,
  createMethod: CreateAnyImplMethod,
): ServiceImpl<T> => {
  const impl: ServiceImpl<typeof service> = {};
  for (const [localName, methodInfo] of Object.entries(service.methods)) {
    const method = createMethod({
      ...methodInfo,
      localName,
      service,
    });
    if (method) impl[localName] = method;
  }
  return impl as ServiceImpl<T>;
};

// Fired on "message" events. Handles rejecting/resolving stored promises.
const outputEventListener =
  <T extends ServiceType>(pending: PendingRequests<T>) =>
  (event: MessageEvent<unknown>) => {
    if (event.source !== window || !isDappGrpcResponse(event.data)) return;

    const { sequence } = event.data;
    if (pending.requests.has(sequence)) {
      const { resolve, reject } = pending.requests.get(sequence)!;

      if (isErrorResponse<T>(event.data)) {
        pending.requests.delete(sequence) && reject(event.data);
      } else if (isResultResponse<T>(event.data)) {
        pending.requests.delete(sequence) && resolve(event.data);
      } else if (isStreamResponse<T>(event.data)) {
        resolve(event.data); // Is a stream, should keep the request as pending
      } else {
        throw new Error(`Type of response not handled ${JSON.stringify(event.data)}`);
      }
    }
  };

// A single request/response handler
const unaryIO = async <T extends ServiceType>(
  pending: PendingRequests<T>,
  messageTypeName: MessageType['typeName'],
  serviceTypeName: ServiceType['typeName'],
): Promise<GrpcResponse<T>> => {
  const sequence = ++pending.sequence;
  const promiseResponse = new Promise<DappMessageResponse<T>>((resolve, reject) => {
    pending.requests.set(sequence, { resolve, reject });
  });
  window.postMessage({
    type: INCOMING_GRPC_MESSAGE,
    sequence,
    messageTypeName,
    serviceTypeName,
  } satisfies DappMessageRequest<T>);
  const response = await promiseResponse;
  if (isResultResponse(response)) {
    return response.result;
  } else {
    throw new Error('Other response types not handled');
  }
};

// Routes to specific method kind
const makeEventImplMethod =
  <T extends ServiceType>(
    pending: PendingRequests<T>,
    serviceTypeName: ServiceType['typeName'],
  ): CreateAnyImplMethod =>
  method => {
    switch (method.kind) {
      case MethodKind.Unary:
        return async (request: Message) => {
          return unaryIO(pending, request.getType().typeName, serviceTypeName);
        };
      default:
        return null;
    }
  };

// Helper exposed to consumers to communicate with extension as a grpc view service.
// Usage:
//    const client = createPromiseClient(ViewProtocolService, createEventTransport(ViewProtocolService));
//    const response = await this.client.chainParameters(req);
export const createEventTransport = <T extends ServiceType>(s: T) =>
  createRouterTransport(({ service }) => {
    const pending: PendingRequests<T> = {
      sequence: 0,
      requests: new Map(),
    };
    window.addEventListener('message', outputEventListener(pending));
    service(s, makeAnyServiceImpl(s, makeEventImplMethod(pending, s.typeName)));
  });
