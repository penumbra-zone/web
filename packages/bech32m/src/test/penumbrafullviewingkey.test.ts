import { describe } from 'vitest';
import { bech32mFullViewingKey, fullViewingKeyFromBech32m } from '../penumbrafullviewingkey';
import { generateTests } from './util/generate-tests';

describe('fvk conversion', () => {
  const okInner = new Uint8Array([
    96, 146, 69, 187, 236, 3, 245, 228, 42, 194, 121, 104, 201, 250, 8, 194, 87, 95, 93, 29, 171,
    250, 177, 162, 130, 226, 176, 56, 91, 122, 89, 9, 34, 67, 106, 56, 17, 73, 174, 234, 72, 54,
    212, 210, 111, 5, 34, 249, 15, 60, 220, 191, 1, 224, 210, 114, 210, 205, 9, 187, 72, 115, 75, 2,
  ]);
  const okBech32 =
    'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09';

  generateTests(
    'penumbrafullviewingkey',
    'inner',
    okInner,
    okBech32,
    bech32mFullViewingKey,
    fullViewingKeyFromBech32m,
  );
});
