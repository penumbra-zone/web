import type { JsonValue } from '@bufbuild/protobuf';

// transport meta

export interface TransportError<I extends string | undefined> extends Partial<TransportEvent> {
  requestId: I extends string ? string : string | undefined;
  error: JsonValue;
  metadata?: Extract<HeadersInit, JsonValue>;
}

// transport content

export type TransportData = TransportMessage | TransportStream;

export interface TransportEvent<I extends string = string> {
  requestId: I;
  header?: Extract<HeadersInit, JsonValue>;
  trailer?: Extract<HeadersInit, JsonValue>;
}

export interface TransportAbort<I = string> extends TransportEvent<I extends string ? I : never> {
  abort: true;
}

export interface TransportMessage<I = string> extends TransportEvent<I extends string ? I : never> {
  message: JsonValue;
}

// in-channel stream
export interface TransportStream<I = string> extends TransportEvent<I extends string ? I : never> {
  stream: ReadableStream<JsonValue>;
}

// guards

const isObj = (o: unknown): o is object => typeof o === 'object' && o !== null;

export const isTransportError = <I extends string>(e: unknown, id?: I): e is TransportError<I> =>
  isObj(e) && 'error' in e && (!id || ('requestId' in e && e.requestId === id));

export const isTransportData = (t: unknown): t is TransportData =>
  isTransportMessage(t) || isTransportStream(t);

export const isTransportEvent = <I extends string>(t: unknown, id?: I): t is TransportEvent<I> =>
  isObj(t) &&
  'requestId' in t &&
  typeof t.requestId === 'string' &&
  (id ? t.requestId === id : true);

export const isTransportMessage = <I extends string>(
  m: unknown,
  id?: I,
): m is TransportMessage<I> => isTransportEvent(m, id) && 'message' in m;

export const isTransportStream = <I extends string>(s: unknown, id?: I): s is TransportStream<I> =>
  isTransportEvent(s, id) && 'stream' in s && s.stream instanceof ReadableStream;

export const isTransportAbort = <I extends string>(a: unknown, id?: I): a is TransportAbort<I> =>
  isTransportEvent(a, id) && 'abort' in a && a.abort === true;
