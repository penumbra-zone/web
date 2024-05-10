import type { Prefix } from './prefix';

export const StringLength = {
  passet: 65,
  pauctid: 66,
  penumbra: 143,
  penumbracompat1: 150,
  penumbrafullviewingkey: 132,
  penumbragovern: 73,
  penumbraspendkey: 75,
  penumbravalid: 72,
  penumbrawalletid: 75,
  plpid: 64,
} as const satisfies Required<Record<Prefix, number>>;
