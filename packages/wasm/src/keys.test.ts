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

    it('equal to penumbraspendkey1fcesjzswatt6g6hkr0jvu6svc8xl7zq3yzzxrnkaz470nvc039ts8c3e4d', () => {
      const spendKey = generateSpendKey(seedPhrase);
      expect(spendKey).equal(
        'penumbraspendkey1fcesjzswatt6g6hkr0jvu6svc8xl7zq3yzzxrnkaz470nvc039ts8c3e4d',
      );
    });
  });

  describe('generateFullViewingKey()', () => {
    it('does not raise zod validation error', () => {
      const spendKey = generateSpendKey(seedPhrase);

      expect(() => {
        getFullViewingKey(spendKey);
      }).not.toThrow();
    });

    it('equal to penumbrafullviewingkey1qjr5suw82hz2tl9jpmurzj7vlc4vwp3zlsc6007c4ckrlmg7nvx567v3mekx4ugf9l6wnmhrw7y6602vrp8ehhw0axxud4saywy4yrsu3masu', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);
      expect(fullViewingKey).equal(
        'penumbrafullviewingkey1qjr5suw82hz2tl9jpmurzj7vlc4vwp3zlsc6007c4ckrlmg7nvx567v3mekx4ugf9l6wnmhrw7y6602vrp8ehhw0axxud4saywy4yrsu3masu',
      );
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

    it('equal to penumbrav2t1na5nelwxrfhsfwftm7hefgqrn5qc87kwrs9ydqlans2srau7r23edrq3dsf664efd6c0dys8zyetlfxl64ealxvt7kfqhjflhulwrf3s20lervj8gd602e02qvqwr4nmh2tpyc', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);
      const zeroAddress = getAddressByIndex(fullViewingKey, 0);
      expect(zeroAddress).equal(
        'penumbrav2t1na5nelwxrfhsfwftm7hefgqrn5qc87kwrs9ydqlans2srau7r23edrq3dsf664efd6c0dys8zyetlfxl64ealxvt7kfqhjflhulwrf3s20lervj8gd602e02qvqwr4nmh2tpyc',
      );
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

    it('equal to penumbrav2t1na5nelwxrfhsfwftm7hefgqr…', () => {
      const spendKey = generateSpendKey(seedPhrase);
      const fullViewingKey = getFullViewingKey(spendKey);
      const zeroAddress = getShortAddressByIndex(fullViewingKey, 0);
      expect(zeroAddress).equal('penumbrav2t1na5nelwxrfhsfwftm7hefgqr…');
    });
  });
});
