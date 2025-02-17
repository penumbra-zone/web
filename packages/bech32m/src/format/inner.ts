import type { Prefix } from './prefix.js';

export const Inner = {
  passet: 'inner',
  pauctid: 'inner',
  penumbra: 'inner',
  penumbrafullviewingkey: 'inner',
  penumbragovern: 'gk',
  penumbraspendkey: 'inner',
  penumbravalid: 'ik',
  penumbrawalletid: 'inner',
  plpid: 'inner',
} as const satisfies Required<Record<Prefix, string>>;
