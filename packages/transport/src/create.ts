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
  createRegistry,
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
  jsonOptions?: Partial<JsonReadOptions & JsonWriteOptions>;
  serviceType: ServiceType;
  getPort: (serviceType: string) => MessagePort | Promise<MessagePort>;
}

export const createChannelTransport = ({
  serviceType,
  getPort,
  defaultTimeoutMs,
  jsonOptions,
}: ChannelTransportOptions) => {
  // if you supply your own registry in jsonOptions, it should at minimum
  // contain message types for this service, or serialization will fail.
  const typeRegistry = jsonOptions?.typeRegistry ?? createRegistry(serviceType);

  const pending = new Map<
    ReturnType<typeof crypto.randomUUID>,
    (response: TransportEvent) => void
  >();

  // this is used to recover errors from transportListener, which can't throw
  // unfortunately, a nonspecific listener throw may be dislocated in time.
  let listenerError: ConnectError | undefined;

  // private, top-level port for this transport
  let port: MessagePort | undefined;

  /**
   * This function is called on the first request.  It begins channel init at
   * that moment, using the `getPort` function from options.  Message listeners
   * are attached during this process.  Failure will reject the first request.
   *
   * Any createChannelTransport caller should supply  `defaultTimeoutMs` or init
   * may stall forever.
   *
   * @returns A promise that resolves when the channel is connected.
   */
  const connect = () =>
    Promise.resolve(getPort(serviceType.typeName)).then((port: MessagePort) => {
      const initTimeout = new Promise<never>(
        (_, reject) =>
          defaultTimeoutMs &&
          setTimeout(
            reject,
            defaultTimeoutMs,
            new ConnectError('Channel connection timed out', ConnectErrorCode.Unavailable),
          ),
      );

      // init promises a useable MessagePort for top-level transport, resolved
      // on the first connectionState call.  connectionState is declared outside
      // the promise so it's accessible to the transport message listener.
      let connectionState: (s: TransportState) => void;
      const init = new Promise<MessagePort>((resolve, reject) => {
        connectionState = ({ connected, reason }: TransportState) => {
          if (connected) resolve(port);
          else {
            port.close();
            const err = errorFromJson(reason!, {}, new ConnectError('Channel connection rejected'));
            // this rejects the init promise
            reject(err);
            // this throws to transportListener, not the init promise
            throw err;
          }
        };
      });

      // message listener to be immediately attached to the port.  closes over
      // connectionState from this scope.  resolves init, handles events,
      // handles errors.
      const transportListener = (ev: MessageEvent<unknown>) => {
        try {
          // the first connectionState call resolves init. subsequent calls are
          // a no-op for the promise, but can throw back here.
          if (isTransportState(ev.data)) connectionState(ev.data);
          else if (isTransportEvent(ev.data)) {
            const respond = pending.get(ev.data.requestId);
            if (!respond) throw Error(`Request ${ev.data.requestId} not pending`);
            respond(ev.data);
          } else if (isTransportError(ev.data))
            throw errorFromJson(ev.data.error, {}, new ConnectError('Transport error'));
          else throw Error('Unknown transport item');
        } catch (error) {
          const err = ConnectError.from(error);
          // throwing from a listener is pointless. store the first error, log
          listenerError ??= err;
          console.error('Error in transport listener', err);
        }
      };

      port.addEventListener('message', transportListener);
      port.start();

      return Promise.race([initTimeout, init]);
    });

  const request = async (request: AnyMessage) => {
    if (listenerError) throw listenerError;

    // if we don't already have a port, go get one
    port ??= await connect();

    const requestId = crypto.randomUUID();
    const message = Any.pack(request).toJson({ typeRegistry });

    // this promise is resolved by transportListener
    const futureResponse = new Promise<JsonValue | ReadableStream<JsonValue>>((resolve, reject) =>
      pending.set(requestId, (response: TransportEvent) => {
        if (listenerError) reject(listenerError);
        else if (!pending.delete(requestId))
          throw Error(`Responding to ${requestId} but it's already resolved`);
        else if (requestId !== response.requestId)
          throw Error(`Responding to ${requestId} but ${response.requestId} doesn't match`);
        else if (isTransportError(response))
          reject(errorFromJson(response.error, {}, new ConnectError('Transport error')));
        else if (isTransportMessage(response)) resolve(response.message);
        else if (isTransportStream(response)) resolve(response.stream);
        else reject('Response kind unimplemented');
      }),
    );

    port.postMessage({ requestId, message } satisfies TransportMessage);
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
