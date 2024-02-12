import { describe, expect, it } from 'vitest';
import { decodeSctRoot } from './sct';

describe('tct', () => {
  describe('decodeSctRoot()', () => {
    it('does not raise zod validation error', () => {
      const root = new Uint8Array([
        10, 32, 50, 68, 201, 21, 142, 211, 35, 124, 216, 158, 24, 100, 137, 54, 212, 195, 130, 17,
        160, 58, 0, 158, 208, 124, 120, 162, 25, 141, 214, 66, 221, 3,
      ]);

      expect(() => {
        decodeSctRoot(root);
      }).not.toThrow();
    });
  });
});
