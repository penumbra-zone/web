// NOTE: Code taken and modified from original: https://github.com/turbocrime/transport-demo

import { Code, ConnectError, createRouterTransport, ServiceImpl } from '@connectrpc/connect';
import { MethodKind, ServiceType } from '@bufbuild/protobuf';
import {
  CreateAnyImplMethod,
  GrpcRequest,
  GrpcResponse,
  isErrorResponse,
  isServiceGrpcResponse,
  isStreamResponse,
  isUnaryResponse,
  PendingRequests,
} from './types';
import { unaryIO } from './unary';
import { serverStreamIO } from './stream';

// Creates a new service implementation by wrapping the original with the special event transport methods
const makeAnyServiceImpl = <S extends ServiceType>(
  service: ServiceType,
  createMethod: CreateAnyImplMethod,
): ServiceImpl<S> => {
  const impl: ServiceImpl<typeof service> = {};
  for (const [localName, methodInfo] of Object.entries(service.methods)) {
    const method = createMethod({
      ...methodInfo,
      localName,
      service,
    });
    if (method) impl[localName] = method;
  }
  return impl as ServiceImpl<S>;
};

// Fired on message events coming from extension. Handles rejecting/resolving stored promises.
const outputEventListener =
  <S extends ServiceType>(pending: PendingRequests<S>, service: S) =>
  (event: MessageEvent<unknown>) => {
    if (event.source !== window || !isServiceGrpcResponse(service, event.data)) return;

    console.log(event.data);

    const { sequence } = event.data;

    if (pending.requests.has(sequence)) {
      const { resolve, reject } = pending.requests.get(sequence)!;

      if (isErrorResponse<S>(event.data)) {
        pending.requests.delete(sequence) && reject(event.data);
      } else if (isUnaryResponse<S>(event.data)) {
        pending.requests.delete(sequence) && resolve(event.data);
      } else if (isStreamResponse<S>(event.data)) {
        if (event.data.stream.done) {
          pending.requests.delete(sequence) && resolve(event.data);
        } else {
          resolve(event.data);
        }
      } else {
        throw new ConnectError(
          `Type of response not handled ${JSON.stringify(event.data)}`,
          Code.Unimplemented,
        );
      }
    } else {
      throw new ConnectError(`No pending requests for sequence: ${sequence}`, Code.NotFound);
    }
  };

// Gets the matching Response object for the Request object.
// Needed as JSON serialized objects are sent back from the extension.
const getResFromReq = <S extends ServiceType>(service: S, req: GrpcRequest<S>): GrpcResponse<S> => {
  const match = Object.values(service.methods).find(m => m.I.typeName === req.getType().typeName);
  if (!match)
    throw new ConnectError(
      `Cannot find corresponding response method for ${req.getType().typeName}`,
      Code.Unimplemented,
    );
  return match.O as GrpcResponse<S>;
};

// Routes to specific method kind
const makeEventImplMethod =
  <S extends ServiceType>(pending: PendingRequests<S>, service: S): CreateAnyImplMethod =>
  method => {
    switch (method.kind) {
      case MethodKind.Unary:
        return async (request: GrpcRequest<S>) => {
          const result = await unaryIO(pending, request, service.typeName);
          return getResFromReq(service, request).fromJson(result);
        };
      case MethodKind.ServerStreaming:
        return async function* (request: GrpcRequest<S>) {
          const stream = serverStreamIO(pending, request, service.typeName);
          for await (const res of stream) {
            yield getResFromReq(service, request).fromJson(res);
          }
        };
      default:
        return null;
    }
  };

// Helper exposed to consumers to communicate with extension as a grpc view service.
// Usage:
//    const client = createPromiseClient(ViewProtocolService, createEventTransport(ViewProtocolService));
//    const response = await this.client.chainParameters(req);
export const createEventTransport = <S extends ServiceType>(s: S) =>
  createRouterTransport(({ service }) => {
    const pending: PendingRequests<S> = {
      sequence: 0,
      requests: new Map(),
    };
    window.addEventListener('message', outputEventListener(pending, s));
    service(s, makeAnyServiceImpl(s, makeEventImplMethod(pending, s)));
  });
