import { describe, expect, test } from 'vitest';
import { isPenumbraAddr } from './address';

describe('isPenumbraAddr()', () => {
  test('Identifies correct address', () => {
    const rightAddress =
      'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahhvhypxd';
    expect(isPenumbraAddr(rightAddress)).toBeTruthy();
  });

  test('incorrect length returns false', () => {
    const incorrectLengthAddress = 'penumbra147mfall0zr6a';
    expect(isPenumbraAddr(incorrectLengthAddress)).toBeFalsy();
  });

  test('incorrect prefix returns false', () => {
    const incorrectPrefixAddress =
      'lanumbro147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahhvhypxd';
    expect(isPenumbraAddr(incorrectPrefixAddress)).toBeFalsy();
  });
});
