import { describe, expect, it } from 'vitest';
import { asIdentityKey } from './string';
import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

describe('asIdentityKey()', () => {
  it('correctly decodes a bech32-encoded identity key into an `IdentityKey` object', () => {
    const bech32IdentityKey = 'penumbravalid1qypqxpqtsysgc';

    expect(
      asIdentityKey(bech32IdentityKey).equals(
        new IdentityKey({ ik: new Uint8Array([1, 2, 3, 4]) }),
      ),
    ).toBe(true);
  });

  it('returns `undefined` when passed an invalid string', () => {
    expect(asIdentityKey.optional()('invalidstring')).toBeUndefined();
  });
});
