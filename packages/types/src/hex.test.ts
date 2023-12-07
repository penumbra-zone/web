import { describe, expect, it } from 'vitest';
import { base64ToHex, hexToBase64, hexToUint8Array, uint8ArrayToHex } from './hex';
import { Buffer } from 'Buffer/';

describe('base64ToHex', () => {
  it('should convert base64 string to hexadecimal', () => {
    const base64 = 'SGVsbG8gd29ybGQ=';
    const expectedHex = '48656c6c6f20776f726c64';
    expect(base64ToHex(base64)).toBe(expectedHex);
  });

  it('should handle empty string', () => {
    const base64 = '';
    const expectedHex = '';
    expect(base64ToHex(base64)).toBe(expectedHex);
  });

  it('should throw an error for invalid base64 string', () => {
    const base64 = 'not a valid base64 string';
    expect(() => base64ToHex(base64)).toThrow();
  });
});

describe('hexToBase64', () => {
  it('should convert hexadecimal string to base64', () => {
    const hex = '48656c6c6f20776f726c64';
    const expectedBase64 = 'SGVsbG8gd29ybGQ=';
    expect(hexToBase64(hex)).toBe(expectedBase64);
  });

  it('should handle empty string', () => {
    const hex = '';
    const expectedBase64 = '';
    expect(hexToBase64(hex)).toBe(expectedBase64);
  });
});

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

describe('hexToUint8Array', () => {
  it('should convert a hexadecimal string to a Uint8Array', () => {
    const hexString = '48656c6c6f20576f726c64'; // Hexadecimal representation of "Hello World"
    const expected = new Uint8Array(Buffer.from('Hello World'));
    const result = hexToUint8Array(hexString);
    expect(result).toEqual(expected);
  });

  it('should handle an empty string', () => {
    const hexString = '';
    const expected = new Uint8Array();
    const result = hexToUint8Array(hexString);
    expect(result).toEqual(expected);
  });

  it('should throw an error for a non-hexadecimal string', () => {
    const nonHexString = 'GHIJK';
    expect(() => hexToUint8Array(nonHexString)).toThrow();
  });
});
