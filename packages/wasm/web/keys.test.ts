import { describe, expect, it } from 'vitest';
import {
  generateSpendKey,
  getAddressByIndex,
  getEphemeralByIndex,
  getFullViewingKey,
  getWalletId,
} from './keys';

describe('keys', () => {
  const seedPhrase =
    'benefit cherry cannon tooth exhibit law avocado spare tooth that amount pumpkin scene foil tape mobile shine apology add crouch situate sun business explain';

  describe('generateSpendKey()', () => {
    it('does not raise zod validation error', () => {
      expect(() => {
        generateSpendKey(seedPhrase);
      }).not.toThrow();
    });
  });

  describe('generateFullViewingKey()', () => {
    it('does not raise zod validation error', () => {
      const spendKey = generateSpendKey(seedPhrase);

      expect(() => {
        getFullViewingKey(spendKey);
      }).not.toThrow();
    });
  });

  describe('generateAddressByIndex()', () => {
    it('does not raise zod validation error', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);

      expect(() => {
        getAddressByIndex(fullViewingKey, 0);
      }).not.toThrow();
    });
  });

  describe('getEphemeralByIndex()', () => {
    it('does not raise zod validation error', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);

      expect(() => {
        getEphemeralByIndex(fullViewingKey, 0);
      }).not.toThrow();
    });
  });

  describe('getWalletId()', () => {
    it('does not raise zod validation error', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);

      expect(() => {
        getWalletId(fullViewingKey);
      }).not.toThrow();
    });
  });
});
