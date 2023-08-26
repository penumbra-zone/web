import { describe, expect, it, vi } from 'vitest';
import { generateSpendKey } from './keys';

// Replace the wasm-pack import with the nodejs version so tests can run
vi.mock('@penumbra-zone/wasm-bundler', () => vi.importActual('@penumbra-zone/wasm-nodejs'));

describe('keys', () => {
  describe('generateSpendKey()', () => {
    it('does not raise zod validation error', () => {
      const seedPhrase =
        'mushroom hole price march grid pepper goat position print gaze dignity music milk surge file casino unveil betray observe ethics image topic sphere clap';
      expect(() => {
        generateSpendKey(seedPhrase);
      }).not.toThrow();
    });
  });
});
