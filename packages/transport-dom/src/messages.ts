import type { JsonValue } from '@bufbuild/protobuf';

// transport meta

export interface TransportError extends Partial<TransportEvent> {
  error: JsonValue;
  metadata?: [string, string][] | Record<string, string>;
}

// transport content

export interface TransportEvent {
  requestId: string;
  header?: [string, string][] | Record<string, string>;
  trailer?: [string, string][] | Record<string, string>;
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
export const isTransportEvent = (t: unknown): t is TransportEvent =>
  typeof t === 'object' && t != null && 'requestId' in t && typeof t.requestId === 'string';

export const isTransportError = (e: unknown): e is TransportError =>
  typeof e === 'object' && e != null && 'error' in e;

export const isTransportMessage = (m: unknown): m is TransportMessage =>
  isTransportEvent(m) && 'message' in m;

export const isTransportStream = (s: unknown): s is TransportStream =>
  isTransportEvent(s) && 'stream' in s && s.stream instanceof ReadableStream;

export const isTransportAbort = (a: unknown): a is TransportAbort =>
  isTransportEvent(a) && 'abort' in a && a.abort === true;
