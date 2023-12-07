import {
  createRouterTransport,
  ServiceImpl,
  MethodImpl,
  ConnectRouter,
  ConnectError,
  Code as ConnectErrorCode,
} from '@connectrpc/connect';

import {
  MethodKind,
  MethodInfo,
  ServiceType,
  AnyMessage,
  JsonValue,
  Any,
} from '@bufbuild/protobuf';

import { TransportMessage, isTransportData } from './types';

import { JsonToMessage, streamToGenerator } from './stream';

import { typeRegistry } from '@penumbra-zone/types/src/registry';

type CreateAnyMethodImpl<S extends ServiceType> = (
  methodInfo: MethodInfo & { kind: MethodKind },
) => typeof methodInfo extends S['methods'][keyof S['methods']]
  ? MethodImpl<typeof methodInfo>
  : never;

type CreateAnyServiceImpl = <S extends ServiceType>(
  service: S,
  createMethod: CreateAnyMethodImpl<S>,
) => Partial<ServiceImpl<S>>;

const makeAnyServiceImpl: CreateAnyServiceImpl = <S extends ServiceType>(
  service: S,
  createMethod: CreateAnyMethodImpl<S>,
): Partial<ServiceImpl<S>> => {
  const impl = {} as { [P in keyof S['methods']]: MethodImpl<S['methods'][P]> };
  let localName: keyof S['methods'];
  let methodInfo: MethodInfo;
  for ([localName, methodInfo] of Object.entries(service.methods))
    impl[localName] = createMethod(methodInfo);
  return impl;
};

type ResolveReject<T> = Parameters<ConstructorParameters<typeof Promise<T>>[0]>;

export const createChannelTransport = (s: ServiceType, port: MessagePort) => {
  const pending = new Map<
    ReturnType<typeof crypto.randomUUID>,
    ResolveReject<JsonValue | ReadableStream<JsonValue>>
  >();

  port.addEventListener('message', ev => {
    if (isTransportData(ev.data)) {
      const response = ev.data;
      const [resolve, reject] = pending.get(response.requestId)!;
      if (!pending.delete(response.requestId))
        throw new ConnectError(
          `Request ${response.requestId} not pending`,
          ConnectErrorCode.Internal,
        );
      else if ('message' in response) resolve(response.message);
      else if ('stream' in response) resolve(response.stream);
      else reject(new ConnectError('Unknown response', ConnectErrorCode.Unknown));
    }
  });

  const request = (msg: AnyMessage) => {
    const rpc: TransportMessage = {
      requestId: crypto.randomUUID(),
      message: Any.pack(msg).toJson({ typeRegistry }),
    } as TransportMessage;
    const prom = new Promise<JsonValue | ReadableStream<JsonValue>>((resolve, reject) =>
      pending.set(rpc.requestId, [resolve, reject]),
    );
    port.postMessage(rpc);
    return prom;
  };

  const makeChannelMethodImpl: CreateAnyMethodImpl<typeof s> = method => {
    switch (method.kind) {
      case MethodKind.Unary: {
        return async function (message: AnyMessage) {
          const responseJson = (await request(message)) as JsonValue;
          const response = Any.fromJson(responseJson, { typeRegistry }).unpack(typeRegistry);
          return response;
        };
      }
      case MethodKind.ServerStreaming: {
        return async function* (message: AnyMessage) {
          const responseStream = (await request(message)) as ReadableStream<JsonValue>;
          const response = responseStream.pipeThrough(new JsonToMessage(typeRegistry));
          yield* streamToGenerator(response);
        };
      }
      case MethodKind.ClientStreaming:
      case MethodKind.BiDiStreaming:
        throw new ConnectError('Client streaming unimplemented', ConnectErrorCode.Unimplemented);
    }
  };

  port.start();

  return createRouterTransport(({ service }: ConnectRouter): void => {
    service(s, makeAnyServiceImpl(s, makeChannelMethodImpl));
  });
};
