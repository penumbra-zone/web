import { describe, expect, it } from 'vitest';
import { generateSpendKey, getAddressByIndex, getFullViewingKey } from './keys';
import { getAddressIndexByAddress, isControlledAddress } from './address';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

describe('address', () => {
  const seedPhrase =
    'benefit cherry cannon tooth exhibit law avocado spare tooth that amount pumpkin scene foil tape mobile shine apology add crouch situate sun business explain';
  const spendKey = generateSpendKey(seedPhrase);
  const fullViewingKey = getFullViewingKey(spendKey);

  describe('getAddressIndexByAddress()', () => {
    it('works with controlled addr', () => {
      const address = getAddressByIndex(fullViewingKey, 1);

      expect(getAddressIndexByAddress(fullViewingKey, address)!.account).toBe(1);
    });

    it('returns undefined with uncontrolled addr', () => {
      const address = new Address(
        addressFromBech32m(
          'penumbra1ftmn2a3hf8pxe0e48es8u9rqhny4xggq9wn2caxcjnfwfhwr5s0t3y6nzs9gx3ty5czd0sd9ssfgjt2pcxrq93yvgk2gu3ynmayuwgddkxthce8l445v8x6v07y2sjd8djcr6v',
        ),
      );

      expect(getAddressIndexByAddress(fullViewingKey, address)).toBeUndefined();
    });
  });

  describe('isControlledAddress()', () => {
    it('returns true if the address is controlled', () => {
      const address = getAddressByIndex(fullViewingKey, 1);

      expect(isControlledAddress(fullViewingKey, address)).toBe(true);
    });

    it('returns false if the address is not controlled', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);
      const address = new Address(
        addressFromBech32m(
          'penumbra1ftmn2a3hf8pxe0e48es8u9rqhny4xggq9wn2caxcjnfwfhwr5s0t3y6nzs9gx3ty5czd0sd9ssfgjt2pcxrq93yvgk2gu3ynmayuwgddkxthce8l445v8x6v07y2sjd8djcr6v',
        ),
      );

      expect(isControlledAddress(fullViewingKey, address)).toBe(false);
    });

    it('returns false if the address is undefined', () => {
      expect(isControlledAddress(fullViewingKey, undefined)).toBe(false);
    });
  });
});
