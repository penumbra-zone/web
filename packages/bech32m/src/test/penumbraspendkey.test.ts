import { describe } from 'vitest';
import { spendKeyFromBech32m, bech32mSpendKey } from '../penumbraspendkey';
import { generateTests } from './util/generate-tests';
import { Prefixes } from '../format/prefix';
import { Inner } from '../format/inner';

describe('spend key conversion', () => {
  const okBech32 = 'penumbraspendkey1esjxkxnflw9ucrhhvgshxxpqkkjsf2ak40h2hwsanzvn6x542wnqe8stud';
  const okInner = new Uint8Array([
    204, 36, 107, 26, 105, 251, 139, 204, 14, 247, 98, 33, 115, 24, 32, 181, 165, 4, 171, 182, 171,
    238, 171, 186, 29, 152, 153, 61, 26, 149, 83, 166,
  ]);

  generateTests(
    Prefixes.penumbraspendkey,
    Inner.penumbraspendkey,
    okInner,
    okBech32,
    bech32mSpendKey,
    spendKeyFromBech32m,
  );
});
