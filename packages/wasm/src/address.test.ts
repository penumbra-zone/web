import { describe, expect, it, vi } from 'vitest';
import { generateSpendKey, getAddressByIndex, getFullViewingKey } from './keys';
import { getShortAddressByIndex, isControlledAddress } from './address';
import { bech32Address } from '@penumbra-zone/types';

// Replace the wasm-pack import with the nodejs version so tests can run
vi.mock('@penumbra-zone/wasm-bundler', () => vi.importActual('@penumbra-zone/wasm-nodejs'));

describe('address', () => {
  const seedPhrase =
    'benefit cherry cannon tooth exhibit law avocado spare tooth that amount pumpkin scene foil tape mobile shine apology add crouch situate sun business explain';

  describe('generateShortAddressByIndex()', () => {
    it('does not raise zod validation error', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);

      expect(() => {
        getShortAddressByIndex(fullViewingKey, 0);
      }).not.toThrow();
    });
  });

  describe('isControlledAddress()', () => {
    it('works with controlled addr', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);
      const address = getAddressByIndex(fullViewingKey, 1);

      expect(isControlledAddress(fullViewingKey, bech32Address(address))!.account).toBe(1);
    });

    it('returns undefined with uncontrolled addr', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);
      const address =
        'penumbra1ftmn2a3hf8pxe0e48es8u9rqhny4xggq9wn2caxcjnfwfhwr5s0t3y6nzs9gx3ty5czd0sd9ssfgjt2pcxrq93yvgk2gu3ynmayuwgddkxthce8l445v8x6v07y2sjd8djcr6v';

      expect(isControlledAddress(fullViewingKey, address)).toBeUndefined();
    });
  });
});
