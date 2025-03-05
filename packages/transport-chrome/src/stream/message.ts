import type { JsonValue } from '@bufbuild/protobuf';

// control message types below

export interface StreamValue {
  value: JsonValue;
}

export interface StreamEnd {
  done: true;
}

export interface StreamAbort {
  abort: JsonValue;
}

export const isStreamValue = (s: unknown): s is StreamValue =>
  s != null && typeof s === 'object' && 'value' in s;

export const isStreamEnd = (s: unknown): s is StreamEnd =>
  s != null && typeof s === 'object' && 'done' in s && s.done === true;

export const isStreamAbort = (s: unknown): s is StreamAbort =>
  s != null && typeof s === 'object' && 'abort' in s;
