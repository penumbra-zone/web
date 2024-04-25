import { describe } from 'vitest';
import { bech32mPositionId, positionIdFromBech32 } from '../plpid';
import { generateTests } from './util/generate-tests';
import { Inner } from '../format/inner';
import { Prefixes } from '../format/prefix';

describe('liquidity provider id conversion', () => {
  const okBech32 = 'plpid1fkf3tlv500vgzwc6dkc7g9wnuv6rzezhefefdywq5tt4lyl97rgsd6j689';
  const okInner = new Uint8Array([
    77, 147, 21, 253, 148, 123, 216, 129, 59, 26, 109, 177, 228, 21, 211, 227, 52, 49, 100, 87, 202,
    114, 150, 145, 192, 162, 215, 95, 147, 229, 240, 209,
  ]);

  generateTests(
    Prefixes.plpid,
    Inner.plpid,
    okInner,
    okBech32,
    bech32mPositionId,
    positionIdFromBech32,
  );
});
