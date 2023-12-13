import {
  createRouterTransport,
  ServiceImpl,
  MethodImpl,
  ConnectRouter,
  ConnectError,
  Code as ConnectErrorCode,
} from '@connectrpc/connect';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';

import {
  MethodKind,
  MethodInfo,
  ServiceType,
  AnyMessage,
  JsonValue,
  Any,
} from '@bufbuild/protobuf';

import {
  TransportEvent,
  TransportMessage,
  isTransportError,
  isTransportEvent,
  isTransportMessage,
  isTransportState,
  isTransportStream,
} from './types';

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
) => ServiceImpl<S>;

const makeAnyServiceImpl: CreateAnyServiceImpl = <S extends ServiceType>(
  service: S,
  createMethod: CreateAnyMethodImpl<S>,
): ServiceImpl<S> => {
  const impl = {} as { [P in keyof S['methods']]: MethodImpl<S['methods'][P]> };
  let localName: keyof S['methods'];
  let methodInfo: MethodInfo;
  for ([localName, methodInfo] of Object.entries(service.methods))
    impl[localName] = createMethod(methodInfo);
  return impl;
};

export const createChannelTransport = (s: ServiceType, port: MessagePort) => {
  const pending = new Map<
    ReturnType<typeof crypto.randomUUID>,
    (response: TransportEvent) => void
  >();

  let callbackError: Error | undefined;

  let connected: boolean | undefined;

  let connectionState: (a: boolean, r?: JsonValue) => void;
  const providerAck = Promise.race([
    new Promise<void>((_, reject) =>
      setTimeout(
        reject,
        1000,
        new ConnectError('Channel connection timed out', ConnectErrorCode.Unavailable),
      ),
    ),
    new Promise<void>(
      (ack, reject) =>
        (connectionState = (state: boolean, reason?: JsonValue) => {
          connected = state;
          if (connected) ack();
          else {
            port.close();
            const err = errorFromJson(reason!, {}, new ConnectError('Connection rejected'));
            reject(err);
            callbackError ??= err;
            throw err;
          }
        }),
    ),
  ]);

  port.addEventListener('message', ev => {
    try {
      if (isTransportState(ev.data)) connectionState(ev.data.connected, ev.data.reason);
      else if (isTransportEvent(ev.data)) {
        const respond = pending.get(ev.data.requestId);
        if (!respond) throw Error(`Request ${ev.data.requestId} not pending`);
        respond(ev.data);
      } else if (isTransportError(ev.data))
        throw errorFromJson(ev.data.error, {}, new ConnectError('Transport error'));
      else throw Error('Unknown transport item');
    } catch (error) {
      const err = ConnectError.from(error);
      callbackError ??= err;
      throw err;
    }
  });

  const request = async (msg: AnyMessage) => {
    if (callbackError) throw callbackError;
    await providerAck;

    const rpc: TransportMessage = {
      requestId: crypto.randomUUID(),
      message: Any.pack(msg).toJson({ typeRegistry }),
    };

    const futureResponse = new Promise<JsonValue | ReadableStream<JsonValue>>((resolve, reject) =>
      pending.set(rpc.requestId, (response: TransportEvent) => {
        if (!pending.delete(rpc.requestId))
          throw Error(`Responding to ${rpc.requestId} but it's already resolved`);
        else if (rpc.requestId !== response.requestId)
          throw Error(`Responding to ${rpc.requestId} but ${response.requestId} doesn't match`);
        else if (callbackError) reject(callbackError);
        else if (isTransportError(response))
          reject(errorFromJson(response.error, {}, new ConnectError('Transport error')));
        else if (isTransportMessage(response)) resolve(response.message);
        else if (isTransportStream(response)) resolve(response.stream);
        else reject('Response kind unimplemented');
      }),
    );

    port.postMessage(rpc);
    return futureResponse;
  };

  const makeChannelMethodImpl: CreateAnyMethodImpl<typeof s> = method => {
    switch (method.kind) {
      case MethodKind.Unary: {
        return async function (message: AnyMessage) {
          const responseJson = (await request(message).catch(e => {
            throw ConnectError.from(e);
          })) as JsonValue;
          const response = Any.fromJson(responseJson, { typeRegistry }).unpack(typeRegistry);
          return response;
        };
      }
      case MethodKind.ServerStreaming: {
        return async function* (message: AnyMessage) {
          const responseStream = (await request(message).catch(e => {
            throw ConnectError.from(e);
          })) as ReadableStream<JsonValue>;
          const response = responseStream.pipeThrough(new JsonToMessage(typeRegistry));
          yield* streamToGenerator(response);
        };
      }
      default:
        return () => Promise.reject(`${MethodKind[method.kind]} unimplemented`);
    }
  };

  port.start();

  return createRouterTransport(({ service }: ConnectRouter): void => {
    service(s, makeAnyServiceImpl(s, makeChannelMethodImpl));
  });
};
