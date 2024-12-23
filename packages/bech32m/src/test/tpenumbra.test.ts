import { describe } from 'vitest';
import { generateTests } from './util/generate-tests.js';
import { bech32TransparentAddress, transparentAddressFromBech32 } from '../tpenumbra.js';
import { Prefixes } from '../format/prefix.js';
import { Inner } from '../format/inner.js';

describe('transparent address conversion', () => {
  const okInner = new Uint8Array([
    102, 236, 169, 166, 203, 152, 194, 89, 236, 246, 59, 69, 221, 32, 49, 49, 83, 29, 119, 117, 124,
    201, 194, 156, 219, 251, 137, 202, 157, 235, 1, 15,
  ]);
  const okBech32 = 'tpenumbra1vmk2nfktnrp9nm8k8dza6gp3x9f36am40nyu98xmlwyu480tqy8sr3jfzd';

  generateTests(
    Prefixes.tpenumbra,
    Inner.tpenumbra,
    okInner,
    okBech32,
    bech32TransparentAddress,
    transparentAddressFromBech32,
  );
});
