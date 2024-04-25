import { describe } from 'vitest';
import { generateTests } from './util/generate-tests';
import { bech32mIdentityKey, identityKeyFromBech32m } from '../penumbravalid';
import { Prefixes } from '../format/prefix';
import { Inner } from '../format/inner';

describe('validator id conversion', () => {
  const okInner = new Uint8Array([
    46, 58, 148, 196, 175, 59, 251, 179, 127, 129, 196, 184, 185, 223, 27, 243, 46, 113, 201, 57,
    96, 186, 251, 132, 209, 136, 103, 239, 205, 105, 211, 8,
  ]);
  const okBech32 = 'penumbravalid19caff39080amxlupcjutnhcm7vh8rjfevza0hpx33pn7lntf6vyqvuekzh';

  generateTests(
    Prefixes.penumbravalid,
    Inner.penumbravalid,
    okInner,
    okBech32,
    bech32mIdentityKey,
    identityKeyFromBech32m,
  );
});
