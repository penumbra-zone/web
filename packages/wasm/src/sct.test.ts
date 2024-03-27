import { describe, expect, test } from 'vitest';
import { validSctRoot } from './sct';
import { valid_sct_root } from '../wasm';

describe('sct', () => {
  const valid = new Uint8Array([
    10, 32, 50, 68, 201, 21, 142, 211, 35, 124, 216, 158, 24, 100, 137, 54, 212, 195, 130, 17, 160,
    58, 0, 158, 208, 124, 120, 162, 25, 141, 214, 66, 221, 3,
  ]);

  describe('valid_sct_root', () => {
    test('detects valid root hash', () => expect(valid_sct_root(valid)).toEqual(true));
    test('detects invalid root hash', () =>
      expect(valid_sct_root(new Uint8Array())).toEqual(false));
  });

  describe('validSctRoot()', () => {
    test('detects valid root hash', () =>
      expect(
        validSctRoot({
          inner: valid,
        }),
      ).toEqual(true));
    test('detects invalid root hash', () =>
      expect(
        validSctRoot({
          inner: new Uint8Array(),
        }),
      ).toEqual(false));
  });
});
