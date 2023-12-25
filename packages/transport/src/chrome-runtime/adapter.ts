import { Any, AnyMessage, JsonValue, MethodKind, ServiceType } from '@bufbuild/protobuf';
import {
  CallOptions,
  ConnectError,
  Code as ConnectErrorCode,
  ConnectRouter,
  ContextValues,
  PromiseClient,
  ServiceImpl,
  createPromiseClient,
  createRouterTransport,
} from '@connectrpc/connect';
import { typeRegistry } from '@penumbra-zone/types/src/registry';
import { iterableToStream, MessageToJson } from '../stream';

// like types not exported from @connectrpc/connect/promise-client
type AnyUnaryFn = (r: AnyMessage, o?: CallOptions) => Promise<AnyMessage>;
type AnyServerStreamingFn = (r: AnyMessage, o?: CallOptions) => AsyncIterable<AnyMessage>;
//type AnyClientStreamingFn = (r: AsyncIterable<AnyMessage>, o?: CallOptions) => Promise<AnyMessage>;
//type AnyBiDiStreamingFn = (r: AsyncIterable<AnyMessage>, o?: CallOptions) => AsyncIterable<AnyMessage>;

export interface ChromeRuntimeCallOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
  contextValues: ContextValues;
}

/**
 * This method creates a simple entry function into any service. The entry
 * accepts a serialized json request, annotated with any type handled by the
 * service, and returns a serialized single response or stream of responses.
 *
 * @param serviceType ServiceType of the service
 * @param impl Object containing an implementation of the service
 * @param remote Client to a remote service, for fallback/proxy
 * @returns (req: JsonValue) => Promise<JsonValue> | ReadableStream<JsonValue>
 */
export const adaptServiceImpl = <S extends ServiceType>(
  serviceType: S,
  impl: Partial<ServiceImpl<S>>,
  remote?: PromiseClient<S>,
  //ctxInit?: ContextValues,
) => {
  const implRoutes = (router: ConnectRouter) => router.service(serviceType, impl);
  const implClient = createPromiseClient(serviceType, createRouterTransport(implRoutes));

  // TODO: this is unnecessary?
  const namedInfo = new Map(
    Object.entries(serviceType.methods).map(([localName, methodInfo]) => {
      return [methodInfo.I.typeName, { localName, ...methodInfo }] as const;
    }),
  );

  return async (
    req: JsonValue,
    opt?: ChromeRuntimeCallOptions,
  ): Promise<JsonValue | ReadableStream<JsonValue>> => {
    const unpackedReq = Any.fromJson(req, { typeRegistry }).unpack(typeRegistry)!;
    const reqType = unpackedReq.getType();

    const info = namedInfo.get(reqType.typeName);
    if (!info)
      throw new ConnectError(
        `Unknown method ${reqType.typeName} on service ${serviceType.typeName}`,
        ConnectErrorCode.NotFound,
      );
    const { localName, kind } = info;
    const handlerMethod = impl[localName] ? implClient[localName] : remote?.[localName];
    if (!handlerMethod)
      throw new ConnectError(
        `No handler for ${reqType.typeName} of ${serviceType.typeName}`,
        ConnectErrorCode.NotFound,
      );

    switch (kind) {
      case MethodKind.Unary: {
        const res = (handlerMethod as AnyUnaryFn)(unpackedReq, opt);
        return Any.pack(await res).toJson({ typeRegistry });
      }
      case MethodKind.ServerStreaming: {
        const res = (handlerMethod as AnyServerStreamingFn)(unpackedReq, opt);
        return iterableToStream(res).pipeThrough(new MessageToJson(typeRegistry));
      }
      default:
        throw new ConnectError('Client streaming unimplemented', ConnectErrorCode.Unimplemented);
    }
  };
};
