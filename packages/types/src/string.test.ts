import { describe, expect, it } from 'vitest';
import { shorten, stringToUint8Array, uint8ArrayToString } from './string';

describe('stringToUint8Array', () => {
  it('should return correct Uint8Array for ASCII strings', () => {
    const str = 'Hello, world!';
    const expected = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33]); // UTF-8 codes for 'Hello, world!'
    const result = stringToUint8Array(str);
    expect(result).toEqual(expected);
  });

  it('should return correct Uint8Array for non-ASCII strings', () => {
    const str = 'こんにちは世界'; // "Hello, world!" in Japanese
    const expected = new Uint8Array([
      227, 129, 147, 227, 130, 147, 227, 129, 171, 227, 129, 161, 227, 129, 175, 228, 184, 150, 231,
      149, 140,
    ]); // UTF-8 codes for 'こんにちは世界'
    const result = stringToUint8Array(str);
    expect(result).toEqual(expected);
  });

  it('should return an empty Uint8Array for an empty string', () => {
    const str = '';
    const expected = new Uint8Array([]);
    const result = stringToUint8Array(str);
    expect(result).toEqual(expected);
  });
});

describe('Uint8Array to String conversion', () => {
  it('should convert Uint8Array to String correctly', () => {
    const originalString = 'Hello, world!';
    const uint8Array = stringToUint8Array(originalString);
    const convertedString = uint8ArrayToString(uint8Array);

    expect(convertedString).toEqual(originalString);
  });

  it('should handle empty string', () => {
    const originalString = '';
    const uint8Array = stringToUint8Array(originalString);
    const convertedString = uint8ArrayToString(uint8Array);

    expect(convertedString).toEqual(originalString);
  });

  it('should handle non-English characters', () => {
    const originalString = 'こんにちは、world！';
    const uint8Array = stringToUint8Array(originalString);
    const convertedString = uint8ArrayToString(uint8Array);

    expect(convertedString).toEqual(originalString);
  });
});

describe('shorten()', () => {
  it('returns the original string when string length is less than or equal to 6', () => {
    const input = 'abcdef';
    const output = shorten(input);
    expect(output).toBe('abcdef');
  });

  it('returns a shortened string when string length is more than 6', () => {
    const input = 'abcdefgh';
    const output = shorten(input);
    expect(output).toBe('abcdefgh');
  });

  it('returns a shortened string when string length is exactly 7', () => {
    const input = 'abcdefgh';
    const output = shorten(input, 4);
    expect(output).toBe('abcdefgh');
  });

  it('returns empty string when input is empty string', () => {
    const input = '';
    const output = shorten(input);
    expect(output).toBe('');
  });

  it('works with custom ends length', () => {
    const input = 'abcdefghijklmnop';
    const outputA = shorten(input, 6);
    expect(outputA).toBe('abcdef...klmnop');
    const outputB = shorten(input, 1);
    expect(outputB).toBe('a...p');
  });
});
