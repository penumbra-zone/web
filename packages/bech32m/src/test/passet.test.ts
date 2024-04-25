import { describe } from 'vitest';
import { generateTests } from './util/generate-tests';
import { assetIdFromBech32m, bech32mAssetId } from '../passet';
import { Prefixes } from '../format/prefix';
import { Inner } from '../format/inner';

describe('asset id conversion', () => {
  const okBech32 = 'passet1vhga2czmpk76hsu3t7usjj2a2qga0u29vqlcp3hky8lwkfz30qrqy6gaae';
  const okInner = new Uint8Array([
    101, 209, 213, 96, 91, 13, 189, 171, 195, 145, 95, 185, 9, 73, 93, 80, 17, 215, 241, 69, 96, 63,
    128, 198, 246, 33, 254, 235, 36, 81, 120, 6,
  ]);

  generateTests(
    Prefixes.passet,
    Inner.passet,
    okInner,
    okBech32,
    bech32mAssetId,
    assetIdFromBech32m,
  );
});
