import { describe, expect, it } from 'vitest';
import { uint8ArrayToHex } from './utils';

describe('utils', () => {
  describe('uint8ArrayToHex()', () => {
    it('Converts Uint8Array to Hex string', () => {
      const uint8Array = new Uint8Array([0x00, 0x01, 0x02, 0xfd, 0xfe, 0xff]);
      const expectedOutput = '000102fdfeff';
      expect(uint8ArrayToHex(uint8Array)).toEqual(expectedOutput);
    });

    it('Converts empty Uint8Array to an empty string', () => {
      const uint8Array = new Uint8Array([]);
      const expectedOutput = '';
      expect(uint8ArrayToHex(uint8Array)).toEqual(expectedOutput);
    });

    it('Handles single element Uint8Array', () => {
      const uint8Array = new Uint8Array([0xab]);
      const expectedOutput = 'ab';
      expect(uint8ArrayToHex(uint8Array)).toEqual(expectedOutput);
    });

    it('Converts Uint8Array with single digit hex numbers correctly', () => {
      const uint8Array = new Uint8Array([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9]);
      const expectedOutput = '00010203040506070809';
      expect(uint8ArrayToHex(uint8Array)).toEqual(expectedOutput);
    });
  });
});
