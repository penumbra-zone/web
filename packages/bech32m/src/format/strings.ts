import type { Prefix } from './prefix.js';

export const StringLength = {
  passet: 65,
  pauctid: 66,
  penumbra: 143,
  penumbrafullviewingkey: 132,
  penumbragovern: 73,
  penumbraspendkey: 75,
  penumbravalid: 72,
  penumbrawalletid: 75,
  plpid: 64,
  penumbracompat1: 150,
  tpenumbra: 68,
} as const satisfies Required<Record<Prefix, number>>;
