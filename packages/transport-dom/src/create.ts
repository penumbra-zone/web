import {
  Any,
  AnyMessage,
  JsonReadOptions,
  JsonWriteOptions,
  Message,
  MethodInfo,
  MethodKind,
  PartialMessage,
  ServiceType,
} from '@bufbuild/protobuf';
import { Code, ConnectError, StreamResponse, UnaryResponse } from '@connectrpc/connect';
import { CommonTransportOptions } from '@connectrpc/connect/protocol';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';
import {
  isTransportError,
  isTransportEvent,
  isTransportMessage,
  isTransportStream,
  TransportEvent,
  TransportMessage,
  TransportStream,
} from './messages';

import '@penumbra-zone/polyfills/ReadableStream[Symbol.asyncIterator]';
import ReadableStream from '@penumbra-zone/polyfills/ReadableStream.from';
import '@penumbra-zone/polyfills/Promise.withResolvers';

const forceTransportOptions = {
  httpClient: null as never,
  baseUrl: 'https://in-memory',
  useBinaryFormat: false,
  acceptCompression: [],
  sendCompression: null,
  compressMinBytes: Number.MAX_SAFE_INTEGER,
  readMaxBytes: Number.MAX_SAFE_INTEGER,
  writeMaxBytes: Number.MAX_SAFE_INTEGER,
  interceptors: [],
};

export interface ChannelTransportOptions
  extends Omit<CommonTransportOptions, keyof typeof forceTransportOptions> {
  jsonOptions?: CommonTransportOptions['jsonOptions'] & {
    typeRegistry: NonNullable<(JsonReadOptions & JsonWriteOptions)['typeRegistry']>;
  };
  getPort: () => PromiseLike<MessagePort>;
}

export const createChannelTransport = ({
  getPort,
  defaultTimeoutMs,
  jsonOptions,
}: ChannelTransportOptions) => {
  const pending = new Map<string, (response: TransportEvent) => void>();

  // this is used to recover errors that couldn't be thrown at a caller
  const listenerError = Promise.withResolvers<never>();

  // port returned by the penumbra global
  let port: MessagePort | undefined;

  /**
   * This function is called on the first request.  It begins channel init at
   * that moment, using the `getPort` function from options.  Message listeners
   * are attached during this process.  Failure will reject the first request.
   *
   * Any createChannelTransport caller should supply  `defaultTimeoutMs` or init
   * may stall forever.
   *
   * @returns A promise that resolves when the channel is acquired.
   */
  const connect = async () => {
    const initTimeout = new Promise<never>(
      (_, reject) =>
        defaultTimeoutMs &&
        setTimeout(
          reject,
          defaultTimeoutMs,
          new ConnectError('Channel connection request timed out', Code.Unavailable),
        ),
    );

    const gotPort = await Promise.race([getPort(), initTimeout]);

    gotPort.addEventListener('message', transportListener);
    gotPort.start();

    return gotPort;
  };

  const transportListener = ({ data }: MessageEvent<unknown>) => {
    if (isTransportEvent(data)) {
      // this is a response to a specific request.  the port may be shared, so it
      // may contain a requestId we don't know about.  the response may be
      // successful, or contain an error conveyed only to the caller.
      const respond = pending.get(data.requestId);
      if (respond) respond(data);
    } else if (isTransportError(data)) {
      // this is a channel-level error, corresponding to no specific request.
      // this will fail this transport, and every client using this transport.
      // every transport sharing this port will fail independently.
      listenerError.reject(
        errorFromJson(data.error, data.metadata, new ConnectError('Transport failed')),
      );
    } else
      listenerError.reject(
        new ConnectError(
          'Unknown item in transport',
          Code.Unimplemented,
          undefined,
          undefined,
          data,
        ),
      );
  };

  return {
    async unary<I extends Message<I> = AnyMessage, O extends Message<O> = AnyMessage>(
      service: ServiceType,
      method: MethodInfo<I, O>,
      _signal: AbortSignal | undefined, // TODO
      _timeoutMs: number | undefined, // TODO
      header: HeadersInit | undefined,
      input: PartialMessage<I>,
    ): Promise<UnaryResponse<I, O>> {
      port ??= await connect();

      const requestId = crypto.randomUUID();
      const { promise: response, resolve, reject } = Promise.withResolvers<TransportMessage>();
      pending.set(requestId, (tev: TransportEvent) => {
        if (isTransportMessage(tev, requestId)) resolve(tev);
        else if (isTransportError(tev))
          reject(errorFromJson(tev.error, tev.metadata, new ConnectError('Unary failed')));
        else reject(ConnectError.from(tev));
      });

      const message = Any.pack(new method.I(input)).toJson(jsonOptions);
      port.postMessage({ requestId, message, header });

      const success = Promise.race([response, listenerError.promise]);

      return {
        service,
        method,
        stream: false,
        header: new Headers((await success).header),
        trailer: new Headers((await success).trailer),
        message: await success.then(({ message }) => {
          const o = new method.O();
          Any.fromJson(message, jsonOptions).unpackTo(o);
          return o;
        }),
      };
    },

    async stream<I extends Message<I> = AnyMessage, O extends Message<O> = AnyMessage>(
      service: ServiceType,
      method: MethodInfo<I, O>,
      _signal: AbortSignal | undefined, // TODO
      _timeoutMs: number | undefined, // TODO
      header: HeadersInit | undefined,
      input: AsyncIterable<PartialMessage<I>>,
    ): Promise<StreamResponse<I, O>> {
      port ??= await connect();

      const requestId = crypto.randomUUID();
      const { promise: response, resolve, reject } = Promise.withResolvers<TransportStream>();
      pending.set(requestId, (tev: TransportEvent) => {
        if (isTransportStream(tev, requestId)) resolve(tev);
        else if (isTransportError(tev))
          reject(errorFromJson(tev.error, tev.metadata, new ConnectError('Stream failed')));
        else reject(ConnectError.from(tev));
      });

      if (method.kind === MethodKind.ServerStreaming) {
        const iter = input[Symbol.asyncIterator]();
        const [{ value } = { value: null }, { done }] = [await iter.next(), await iter.next()];
        if (done && typeof value === 'object' && value != null) {
          const message = Any.pack(new method.I(value as object)).toJson(jsonOptions);
          port.postMessage({ requestId, message, header } satisfies TransportMessage);
        } else
          throw new ConnectError(
            'MethodKind.ServerStreaming expects a single request message',
            Code.OutOfRange,
          );
      } else {
        const stream = ReadableStream.from(input).pipeThrough(
          new TransformStream({
            transform: (chunk: PartialMessage<I>, cont) =>
              cont.enqueue(Any.pack(new method.I(chunk)).toJson(jsonOptions)),
          }),
        );
        port.postMessage({ requestId, stream, header } satisfies TransportStream, [stream]);
      }

      const success = await Promise.race([response, listenerError.promise]);

      return {
        service,
        method,
        stream: true,
        header: new Headers(success.header),
        trailer: new Headers(success.trailer),
        message: success.stream.pipeThrough(
          new TransformStream({
            transform: (chunk, cont) => {
              const o = new method.O();
              Any.fromJson(chunk, jsonOptions).unpackTo(o);
              cont.enqueue(o);
            },
          }),
        ),
      };
    },
  };
};
