import { describe, expect, it } from 'vitest';
import {
  generateSpendKey,
  getAddressByIndex,
  getEphemeralByIndex,
  getFullViewingKey,
  getWalletId,
} from './keys.js';

describe('keys', () => {
  const seedPhrase =
    'benefit cherry cannon tooth exhibit law avocado spare tooth that amount pumpkin scene foil tape mobile shine apology add crouch situate sun business explain';

  describe('generateSpendKey()', () => {
    it('does not raise zod validation error', async () => {
      await expect(generateSpendKey(seedPhrase)).resolves.toBeDefined();
    });
  });

  describe('generateFullViewingKey()', () => {
    it('does not raise zod validation error', async () => {
      const spendKey = await generateSpendKey(seedPhrase);
      await expect(getFullViewingKey(spendKey)).resolves.toBeDefined();
    });
  });

  describe('generateAddressByIndex()', () => {
    it('does not raise zod validation error', async () => {
      const spendKey = await generateSpendKey(seedPhrase);
      const fullViewingKey = await getFullViewingKey(spendKey);
      await expect(getAddressByIndex(fullViewingKey, 0)).resolves.toBeDefined();
    });
  });

  describe('getEphemeralByIndex()', () => {
    it('does not raise zod validation error', async () => {
      const spendKey = await generateSpendKey(seedPhrase);
      const fullViewingKey = await getFullViewingKey(spendKey);
      await expect(getEphemeralByIndex(fullViewingKey, 0)).resolves.toBeDefined();
    });
  });

  describe('getWalletId()', () => {
    it('does not raise zod validation error', async () => {
      const spendKey = await generateSpendKey(seedPhrase);
      const fullViewingKey = await getFullViewingKey(spendKey);
      await expect(getWalletId(fullViewingKey)).resolves.toBeDefined();
    });
  });
});
