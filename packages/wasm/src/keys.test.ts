import { describe, expect, it, vi } from 'vitest';
import {
  generateSpendKey,
  getAddressByIndex,
  getFullViewingKey,
  getShortAddressByIndex,
} from './keys';

// Replace the wasm-pack import with the nodejs version so tests can run
vi.mock('@penumbra-zone/wasm-bundler', () => vi.importActual('@penumbra-zone/wasm-nodejs'));

describe('keys', () => {
  // don't use this seed phrase for personal use
  const seedPhrase =
    'mushroom hole price march grid pepper goat position print gaze dignity music milk surge file casino unveil betray observe ethics image topic sphere clap';

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

  describe('generateShortAddressByIndex()', () => {
    it('does not raise zod validation error', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);

      expect(() => {
        getShortAddressByIndex(fullViewingKey, 0);
      }).not.toThrow();
    });
  });
});
