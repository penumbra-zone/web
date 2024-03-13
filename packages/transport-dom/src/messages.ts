import type { JsonValue } from '@bufbuild/protobuf';

// transport meta

export interface TransportError extends Partial<TransportEvent> {
  error: JsonValue;
  metadata?: HeadersInit;
}

// transport content

export type TransportData = TransportMessage | TransportStream;

export interface TransportEvent<I extends string = string> {
  requestId: I;
  header?: HeadersInit;
  trailer?: HeadersInit;
  //contextValues?: object;
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

export const isTransportError = (e: unknown): e is TransportError => isObj(e) && 'error' in e;

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
