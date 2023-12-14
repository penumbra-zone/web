import type { JsonValue } from '@bufbuild/protobuf';

// transport meta

export interface TransportState {
  connected: boolean;
  reason?: JsonValue;
}

export interface TransportError extends Partial<TransportEvent> {
  error: JsonValue;
}

// transport content

export type TransportData = TransportMessage | TransportStream | TransportInitChannel;

export interface TransportEvent {
  requestId: ReturnType<typeof crypto.randomUUID>;
}

export interface TransportMessage extends TransportEvent {
  message: JsonValue;
}

// in-channel stream
export interface TransportStream extends TransportEvent {
  stream: ReadableStream<JsonValue>;
}

// sub-channel stream
export interface TransportInitChannel extends TransportEvent {
  channel: string;
}

// sub-channel control

export interface StreamChannelChunk {
  sequence: number;
  value: JsonValue;
}

export interface StreamChannelEnd {
  sequence: number;
  done: true;
}

// guards

const isObj = (o: unknown): o is object => typeof o === 'object' && o !== null;

export const isTransportError = (e: unknown): e is TransportError => isObj(e) && 'error' in e;

export const isTransportData = (t: unknown): t is TransportData =>
  isTransportMessage(t) || isTransportStream(t) || isTransportInitChannel(t);

export const isTransportEvent = (t: unknown): t is TransportEvent =>
  isObj(t) && 'requestId' in t && typeof t.requestId === 'string';

export const isTransportState = (t: unknown): t is TransportState =>
  isObj(t) && 'connected' in t && typeof t.connected === 'boolean';

export const isTransportMessage = (m: unknown): m is TransportMessage =>
  isTransportEvent(m) && 'message' in m;

export const isTransportStream = (s: unknown): s is TransportStream =>
  isTransportEvent(s) && 'stream' in s && s.stream instanceof ReadableStream;

export const isTransportInitChannel = (c: unknown): c is TransportInitChannel =>
  isTransportEvent(c) && 'channel' in c && typeof c.channel === 'string';

export const isStreamControl = (s: unknown): s is StreamChannelChunk | StreamChannelEnd =>
  isObj(s) &&
  'sequence' in s &&
  typeof s.sequence === 'number' &&
  ('value' in s || ('done' in s && s.done === true));
