import type { JsonValue } from '@bufbuild/protobuf';

// transport meta

export interface TransportError {
  requestId?: string;
  error: JsonValue;
  metadata?: HeadersInit & JsonValue;
}

// transport content

export type TransportData = TransportMessage | TransportStream;

export interface TransportEvent {
  requestId: string;
  header?: HeadersInit;
  trailer?: HeadersInit;
  // contextValues?: object;
}

export interface TransportAbort extends TransportEvent {
  abort: true;
}

export interface TransportMessage extends TransportEvent {
  message: JsonValue;
}

// in-channel stream
export interface TransportStream extends TransportEvent {
  stream: ReadableStream<JsonValue>;
}

// guards

export const isTransportError = (e: unknown, id?: string): e is TransportError =>
  e != null &&
  typeof e === 'object' &&
  'error' in e &&
  (!id || ('requestId' in e && e.requestId === id));

export const isTransportData = (t: unknown): t is TransportData =>
  isTransportMessage(t) || isTransportStream(t);

export const isTransportEvent = (t: unknown, id?: string): t is TransportEvent =>
  t != null &&
  typeof t === 'object' &&
  'requestId' in t &&
  typeof t.requestId === 'string' &&
  (id ? t.requestId === id : true);

export const isTransportMessage = (m: unknown, id?: string): m is TransportMessage =>
  isTransportEvent(m, id) && 'message' in m;

export const isTransportStream = (s: unknown, id?: string): s is TransportStream =>
  isTransportEvent(s, id) && 'stream' in s && s.stream instanceof ReadableStream;

export const isTransportAbort = (a: unknown, id?: string): a is TransportAbort =>
  isTransportEvent(a, id) && 'abort' in a && a.abort === true;
