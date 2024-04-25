import { describe } from 'vitest';
import { addressFromBech32m, bech32mAddress } from '../penumbra';
import { generateTests } from './util/generate-tests';

describe('address conversion', () => {
  const okInner = new Uint8Array([
    175, 182, 158, 255, 239, 16, 245, 221, 208, 117, 160, 44, 235, 175, 198, 0, 6, 216, 6, 143, 192,
    155, 159, 103, 97, 103, 136, 5, 78, 209, 17, 200, 68, 220, 182, 45, 20, 246, 181, 16, 117, 182,
    46, 141, 74, 101, 196, 86, 185, 124, 206, 253, 195, 57, 224, 34, 210, 22, 123, 246, 136, 10,
    208, 159, 24, 235, 148, 153, 211, 7, 137, 198, 158, 226, 221, 22, 208, 152, 246, 247,
  ]);
  const okBech32 =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';

  generateTests('penumbra', 'inner', okInner, okBech32, bech32mAddress, addressFromBech32m);
});
