import type { Prefix } from './prefix';

export const ByteLength = {
  passet: 32,
  pauctid: 32,
  penumbra: 80,
  penumbracompat1: 80,
  penumbrafullviewingkey: 64,
  penumbragovern: 32,
  penumbraspendkey: 32,
  penumbravalid: 32,
  penumbrawalletid: 32,
  plpid: 32,
} as const satisfies Required<Record<Prefix, number>>;
