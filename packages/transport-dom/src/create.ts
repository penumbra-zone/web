import {
  Any,
  AnyMessage,
  JsonReadOptions,
  type JsonValue,
  JsonWriteOptions,
  Message,
  MethodInfo,
  MethodKind,
  PartialMessage,
  ServiceType,
} from '@bufbuild/protobuf';
import { Code, ConnectError, StreamResponse, Transport, UnaryResponse } from '@connectrpc/connect';
import { CommonTransportOptions } from '@connectrpc/connect/protocol';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';
import {
  isTransportError,
  isTransportEvent,
  isTransportMessage,
  isTransportStream,
  TransportAbort,
  TransportEvent,
  TransportMessage,
  TransportStream,
} from './messages.js';

import ReadableStream from './ReadableStream.from.js';

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

/**
 * For use with `ConnectError.from`, in `rejectOnSignal`. Identifies an
 * appropriate error code for an unknown throw.
 * - ConnectError.from forwards exising ConnectError codes, ignoring this
 * - ConnectError.from uses `Code.Canceled` for an 'AbortError', ignoring this
 * - We want to apply `Code.DeadlineExceeded` for any 'TimeoutError'
 * - All others should use `Code.Aborted`
 */
const codeForError = (r?: unknown) => {
  if (r instanceof DOMException && r.name === 'TimeoutError') {
    return Code.DeadlineExceeded;
  } else {
    return Code.Aborted;
  }
};

const rejectOnSignal = (...signals: (AbortSignal | undefined)[]) => {
  return new Promise<never>((_, reject) => {
    const signal = AbortSignal.any(signals.filter(s => s instanceof AbortSignal));
    signal.addEventListener('abort', () =>
      reject(ConnectError.from(signal.reason, codeForError(signal.reason))),
    );
    if (signal.aborted) {
      reject(ConnectError.from(signal.reason, codeForError(signal.reason)));
    }
  });
};

export const createChannelTransport = ({
  getPort,
  jsonOptions,
  defaultTimeoutMs = 60_000,
}: ChannelTransportOptions): Transport => {
  const pending = new Map<string, (response: TransportEvent) => void>();

  // this is used to recover errors that couldn't be thrown at a caller
  const transportFailure = new AbortController();

  // port returned by the penumbra global
  let port: MessagePort | undefined;

  /**
   * This function is called on the first request.  It begins channel init at
   * that moment, using the `getPort` function from options.  Message listeners
   * are attached during this process.  Failure will reject the first request.
   *
   * @returns A promise that resolves when the channel is acquired.
   */
  const connect = async () => {
    const connectionPort = await Promise.race([
      getPort(),
      rejectOnSignal(
        defaultTimeoutMs > 0 ? AbortSignal.timeout(defaultTimeoutMs) : undefined,
      ).catch(() =>
        Promise.reject(new ConnectError('Channel connection request timed out', Code.Unavailable)),
      ),
    ]);

    connectionPort.addEventListener('message', transportListener);
    connectionPort.addEventListener('messageerror', (ev: MessageEvent<unknown>) =>
      transportFailure.abort(ConnectError.from(ev.data)),
    );
    connectionPort.start();

    return connectionPort;
  };

  const transportListener = ({ data }: MessageEvent<unknown>) => {
    if (data === false) {
      // 'false' indicating a disconnect
      transportFailure.abort(new ConnectError('Connection closed', Code.Unavailable));
    } else if (isTransportEvent(data)) {
      // this is a response to a specific request.  the port may be shared, so
      // it's okay if it contains a requestId we don't know about.  the response
      // may be successful, or contain an error conveyed only to the caller.
      pending.get(data.requestId)?.(data);
    } else if (isTransportError(data)) {
      // this is a channel-level error, corresponding to no specific request.
      // it will fail this transport, and every client using this transport, and
      // every transport using this channel. every transport sharing this port
      // will fail independently, but the rejection created here will be
      // delivered to every subsequent request attempted on this transport.
      transportFailure.abort(
        errorFromJson(data.error, data.metadata, new ConnectError('Transport failed')),
      );
    } else {
      transportFailure.abort(
        new ConnectError(
          'Unknown item in transport',
          Code.Unimplemented,
          undefined,
          undefined,
          data,
        ),
      );
    }
  };

  return {
    async unary<I extends Message<I> = AnyMessage, O extends Message<O> = AnyMessage>(
      service: ServiceType,
      method: MethodInfo<I, O>,
      signal: AbortSignal | undefined,
      timeoutMs: number | undefined = defaultTimeoutMs,
      header: HeadersInit | undefined,
      input: PartialMessage<I>,
    ): Promise<UnaryResponse<I, O>> {
      transportFailure.signal.throwIfAborted();
      port ??= await connect();

      const requestId = crypto.randomUUID();
      const requestFailure = new AbortController();

      const response = Promise.race([
        rejectOnSignal(
          transportFailure.signal,
          requestFailure.signal,
          timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined,
          signal,
        ),
        new Promise<TransportMessage>((resolve, reject) => {
          pending.set(requestId, (tev: TransportEvent) => {
            if (isTransportMessage(tev, requestId)) {
              resolve(tev);
            } else if (isTransportError(tev, requestId)) {
              reject(errorFromJson(tev.error, tev.metadata, new ConnectError('Unary failed')));
            } else {
              reject(ConnectError.from(tev));
            }
          });
        }),
      ]).finally(() => pending.delete(requestId));

      if (!signal?.aborted) {
        try {
          switch (method.kind) {
            case MethodKind.Unary:
              {
                const message = Any.pack(new method.I(input)).toJson(jsonOptions);
                signal?.addEventListener('abort', () =>
                  port?.postMessage({ requestId, abort: true } satisfies TransportAbort),
                );
                port.postMessage({ requestId, message, header } satisfies TransportMessage);
              }
              break;
            default:
              throw new ConnectError('MethodKind not supported', Code.Unimplemented);
          }
        } catch (e) {
          requestFailure.abort(e);
        }
      }

      return {
        service,
        method,
        stream: false,
        header: new Headers((await response).header),
        trailer: new Headers((await response).trailer),
        message: await response.then(({ message }) => {
          const o = new method.O();
          Any.fromJson(message, jsonOptions).unpackTo(o);
          return o;
        }),
      };
    },

    async stream<I extends Message<I> = AnyMessage, O extends Message<O> = AnyMessage>(
      service: ServiceType,
      method: MethodInfo<I, O>,
      signal: AbortSignal | undefined,
      timeoutMs: number | undefined = defaultTimeoutMs,
      header: HeadersInit | undefined,
      input: AsyncIterable<PartialMessage<I>>,
    ): Promise<StreamResponse<I, O>> {
      transportFailure.signal.throwIfAborted();
      port ??= await connect();

      const requestId = crypto.randomUUID();

      const requestFailure = new AbortController();

      const response = Promise.race([
        rejectOnSignal(
          transportFailure.signal,
          requestFailure.signal,
          timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined,
          signal,
        ),
        new Promise<TransportStream>((resolve, reject) => {
          pending.set(requestId, (tev: TransportEvent) => {
            if (isTransportStream(tev, requestId)) {
              resolve(tev);
            } else if (isTransportError(tev, requestId)) {
              reject(errorFromJson(tev.error, tev.metadata, new ConnectError('Stream failed')));
            } else {
              reject(ConnectError.from(tev));
            }
          });
        }),
      ]).finally(() => pending.delete(requestId));

      if (!signal?.aborted) {
        try {
          switch (method.kind) {
            case MethodKind.ServerStreaming:
              // send as a single message
              {
                // consume the input stream, which should have only one message
                const iter = input[Symbol.asyncIterator]();
                const [{ value } = { value: null }, { done }] = [
                  await iter.next(),
                  await iter.next(),
                ];
                // confirm the input stream ended after one message with content
                if (done && typeof value === 'object' && value !== null) {
                  const message = Any.pack(new method.I(value as object)).toJson(jsonOptions);
                  port.postMessage({ requestId, message, header } satisfies TransportMessage);
                } else {
                  throw new ConnectError(
                    'MethodKind.ServerStreaming expects a single request message',
                    Code.OutOfRange,
                  );
                }
              }
              break;
            case MethodKind.ClientStreaming:
            case MethodKind.BiDiStreaming:
              // send as an actual stream
              {
                const stream: ReadableStream<JsonValue> = ReadableStream.from(input).pipeThrough(
                  new TransformStream({
                    transform: (chunk: PartialMessage<I>, cont) =>
                      cont.enqueue(Any.pack(new method.I(chunk)).toJson(jsonOptions)),
                  }),
                );
                port.postMessage({ requestId, stream, header } satisfies TransportStream, [stream]);
              }
              break;
            default:
              throw new ConnectError('MethodKind not supported', Code.Unimplemented);
          }
        } catch (e) {
          requestFailure.abort(e);
        }
      }

      return {
        service,
        method,
        stream: true,
        header: new Headers((await response).header),
        trailer: new Headers((await response).trailer),
        message: await response.then(({ stream }) =>
          stream.pipeThrough(
            new TransformStream({
              transform: (chunk, cont) => {
                const o = new method.O();
                Any.fromJson(chunk, jsonOptions).unpackTo(o);
                cont.enqueue(o);
              },
            }),
            { signal },
          ),
        ),
      };
    },
  };
};
