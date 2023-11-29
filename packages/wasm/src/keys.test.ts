import { describe, expect, it, vi } from 'vitest';
import {
  generateSpendKey,
  getAddressByIndex,
  getEphemeralByIndex,
  getFullViewingKey,
  getIndexByAddress,
  getShortAddressByIndex,
  getWalletId,
} from './keys';
import { bech32Address } from '@penumbra-zone/types';

// Replace the wasm-pack import with the nodejs version so tests can run
vi.mock('@penumbra-zone/wasm-bundler', () => vi.importActual('@penumbra-zone/wasm-nodejs'));

describe('keys', () => {
  // don't use this seed phrase for personal use
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

  describe('generateShortAddressByIndex()', () => {
    it('does not raise zod validation error', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);

      expect(() => {
        getShortAddressByIndex(fullViewingKey, 0);
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

  describe('getIndexByAddress()', () => {
    it('does not raise zod validation error', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);
      const address = getAddressByIndex(fullViewingKey, 1);

      expect(() => {
        getIndexByAddress(fullViewingKey, bech32Address(address));
      }).not.toThrow();
    });

    it('throw error the other full viewing key is the owner of address', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);
      const address =
        'penumbra122mfall0zr6am5r45qkwht7aqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8rcaw2fn5c838rfackazmgf3ahh09cxmz';

      expect(() => {
        getIndexByAddress(fullViewingKey, address);
      }).toThrowError();
    });
  });
});
