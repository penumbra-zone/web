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
  JsonReadOptions,
  JsonWriteOptions,
  IMessageTypeRegistry,
} from '@bufbuild/protobuf';

import {
  TransportEvent,
  TransportMessage,
  TransportState,
  isTransportError,
  isTransportEvent,
  isTransportMessage,
  isTransportState,
  isTransportStream,
} from './types';

import { JsonToMessage, streamToGenerator } from './stream';

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

export interface ChannelTransportOptions {
  defaultTimeoutMs?: number;
  jsonOptions: Partial<JsonReadOptions & JsonWriteOptions> & {
    typeRegistry: IMessageTypeRegistry;
  };
  serviceType: ServiceType;
  getPort: (serviceType: string) => MessagePort | Promise<MessagePort>;
}

export const createChannelTransport = ({
  serviceType,
  getPort,
  defaultTimeoutMs,
  jsonOptions: { typeRegistry },
}: ChannelTransportOptions) => {
  const pending = new Map<
    ReturnType<typeof crypto.randomUUID>,
    (response: TransportEvent) => void
  >();

  let callbackError: Error | undefined;

  let port: MessagePort | undefined;

  const connect = () =>
    Promise.resolve(getPort(serviceType.typeName)).then((port: MessagePort) => {
      let applyState: (s: TransportState) => void;

      const timeout = new Promise<never>(
        (_, reject) =>
          defaultTimeoutMs &&
          setTimeout(
            reject,
            defaultTimeoutMs,
            new ConnectError('Channel connection timed out', ConnectErrorCode.Unavailable),
          ),
      );

      const ack = new Promise<MessagePort>(
        (resolve, reject) =>
          (applyState = ({ connected, reason }: TransportState) => {
            if (connected) resolve(port);
            else {
              port.close();
              const err = errorFromJson(reason!, {}, new ConnectError('Connection rejected'));
              reject(err);
              callbackError ??= err;
              throw err;
            }
          }),
      );

      port.addEventListener('message', ev => {
        try {
          if (isTransportState(ev.data)) applyState(ev.data);
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

      port.start();

      return Promise.race([timeout, ack]);
    });

  const request = async (msg: AnyMessage) => {
    if (callbackError) throw callbackError;
    port ??= await connect();

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

  const makeChannelMethodImpl: CreateAnyMethodImpl<typeof serviceType> = method => {
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

  return createRouterTransport(({ service }: ConnectRouter): void => {
    service(serviceType, makeAnyServiceImpl(serviceType, makeChannelMethodImpl));
  });
};
