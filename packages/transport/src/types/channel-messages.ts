import type { JsonValue } from '@bufbuild/protobuf';

/**
 * Transport, request or response. These appear in the top-level channel.
 */

export interface TransportEvent {
  responseOrigin?: string;
}

export interface TransportState {
  connected: boolean;
}

export interface TransportMessage extends TransportEvent {
  requestId: ReturnType<typeof crypto.randomUUID>;
  message: JsonValue;
}

// in-channel stream transport
export interface TransportStream extends TransportEvent {
  requestId: ReturnType<typeof crypto.randomUUID>;
  stream: ReadableStream<JsonValue>;
}

// init sub-channel transport
export interface TransportInitChannel extends TransportEvent {
  requestId: ReturnType<typeof crypto.randomUUID>;
  channel: string; // extends ChannelConfigString<infer CC> ? ChannelConfigString<CC> : never;
}

export const isTransportMessage = (x: unknown): x is TransportMessage =>
  isTransportData(x) && 'message' in x;

export const isTransportStream = (x: unknown): x is TransportStream =>
  isTransportData(x) && 'stream' in x;

export const isTransportInitChannel = (x: unknown): x is TransportInitChannel =>
  isTransportData(x) && 'channel' in x;

export const isTransportData = (
  transported: unknown,
): transported is TransportMessage | TransportStream | TransportInitChannel =>
  isTransportEvent(transported) &&
  'requestId' in transported &&
  typeof transported.requestId === 'string' &&
  ('message' in transported || 'stream' in transported || 'channel' in transported);

export const isTransportState = (transported: unknown): transported is TransportState =>
  isTransportEvent(transported) &&
  'connected' in transported &&
  typeof transported.connected === 'boolean';

export const isTransportEvent = (transported: unknown): transported is TransportEvent =>
  typeof transported === 'object' && transported !== null;

/**
 * Control for sub-channel transport in restricted contexts that
 * won't transfer a ReadableStream, such as the browser runtime.
 */

export interface StreamChannelChunk {
  sequence: number;
  value: JsonValue;
}
export interface StreamChannelEnd {
  sequence: number;
  done: true;
}

export const isStreamControl = (
  channed: unknown,
): channed is StreamChannelChunk | StreamChannelEnd =>
  typeof channed === 'object' &&
  channed !== null &&
  'sequence' in channed &&
  typeof channed.sequence === 'number' &&
  ('value' in channed || 'done' in channed);
