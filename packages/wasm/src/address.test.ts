import { describe, expect, it } from 'vitest';
import { generateSpendKey, getAddressByIndex, getFullViewingKey } from './keys';
import { getAddressIndexByAddress } from './address';
import { bech32ToAddress } from '@penumbra-zone/bech32/src/address';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

describe('address', () => {
  const seedPhrase =
    'benefit cherry cannon tooth exhibit law avocado spare tooth that amount pumpkin scene foil tape mobile shine apology add crouch situate sun business explain';

  describe('getAddressIndexByAddress()', () => {
    it('works with controlled addr', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);
      const address = getAddressByIndex(fullViewingKey, 1);

      expect(getAddressIndexByAddress(fullViewingKey, address)!.account).toBe(1);
    });

    it('returns undefined with uncontrolled addr', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);
      const address = new Address({
        inner: bech32ToAddress(
          'penumbra1ftmn2a3hf8pxe0e48es8u9rqhny4xggq9wn2caxcjnfwfhwr5s0t3y6nzs9gx3ty5czd0sd9ssfgjt2pcxrq93yvgk2gu3ynmayuwgddkxthce8l445v8x6v07y2sjd8djcr6v',
        ),
      });

      expect(getAddressIndexByAddress(fullViewingKey, address)).toBeUndefined();
    });
  });
});
