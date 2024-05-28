import { describe, test, expect } from 'vitest';
import { assetIdFromBaseDenom } from './asset';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { randomBytes } from 'crypto';
import { assetIdFromBech32m } from '@penumbra-zone/bech32m/passet';

// not human legible or restricted to any charset
const randomString = (byteLength = 32) =>
  randomBytes(1 + Math.random() * (byteLength - 1)).toString();

describe('assetIdFromBaseDenom', () => {
  test('should return the correct asset id for a known asset id', () => {
    const upenumbraFromBech32m = new AssetId(
      assetIdFromBech32m('passet1984fctenw8m2fpl8a9wzguzp7j34d7vravryuhft808nyt9fdggqxmanqm'),
    );

    const upenumbraFromBaseDenom = assetIdFromBaseDenom('upenumbra');

    expect(AssetId.equals(upenumbraFromBech32m, upenumbraFromBaseDenom)).toBeTruthy();
  });

  test('should return a 32-byte asset id for any string', () => {
    const randomIds = Array.from(Array(10), randomString).map(denom => assetIdFromBaseDenom(denom));

    expect(
      randomIds.every(
        id => id instanceof AssetId && id.inner instanceof Uint8Array && id.inner.length === 32,
      ),
    ).toBeTruthy();
  });

  test('should return same asset id for same string', () => {
    const sameAltBaseDenom = randomString();
    const a1 = assetIdFromBaseDenom(sameAltBaseDenom);
    const a2 = assetIdFromBaseDenom(sameAltBaseDenom);

    expect(a1.inner).toEqual(a2.inner);
  });

  test(
    'should return different asset id for different strings',
    { retry: 2 }, // there is a chance that this test could fail randomly :)
    () => {
      const someAltBaseDenom = randomString();
      const differentAltBaseDenom = randomString();
      const a = assetIdFromBaseDenom(someAltBaseDenom);
      const b = assetIdFromBaseDenom(differentAltBaseDenom);

      expect(a.inner).not.toEqual(b.inner);
    },
  );
});
