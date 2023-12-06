import { describe, expect, it } from 'vitest';
import { Buffer } from 'Buffer';
import {
  Base64StringSchema,
  base64ToUint8Array,
  InnerBase64Schema,
  uint8ArrayToBase64,
} from './base64';
import { SafeParseError } from 'zod/lib/types';

describe('Base64StringSchema', () => {
  it('validates base64 strings', () => {
    const validBase64 = 'SGVsbG8gd29ybGQ='; // 'Hello world' in base64
    const result = Base64StringSchema.safeParse(validBase64);
    expect(result.success).toBe(true);
  });

  it('rejects non-base64 strings', () => {
    const invalidBase64 = 'not a base64 string';
    const result = Base64StringSchema.safeParse(invalidBase64) as SafeParseError<string>;
    expect(result.success).toBe(false);
    expect(result.error.message.includes('Invalid base64 string')).toBeTruthy();
  });
});

describe('InnerBase64Schema', () => {
  it('validates objects with base64 strings', () => {
    const validInput = { inner: 'SGVsbG8gd29ybGQ=' }; // 'Hello world' in base64
    const result = InnerBase64Schema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects objects without base64 strings', () => {
    const invalidInput = { inner: 'not a base64 string' };
    const result = InnerBase64Schema.safeParse(invalidInput) as SafeParseError<string>;
    expect(result.success).toBe(false);
    expect(result.error.message.includes('Invalid base64 string')).toBeTruthy();
  });

  it('rejects non-object inputs', () => {
    const nonObjectInput = 'not an object';
    const result = InnerBase64Schema.safeParse(nonObjectInput);
    expect(result.success).toBe(false);
  });
});

describe('base64ToUint8Array', () => {
  it('should correctly convert a Base64 string to Uint8Array', () => {
    const base64String = 'SGVsbG8gd29ybGQ='; // 'Hello world' in Base64
    const expectedUint8Array = new Uint8Array([
      72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
    ]); // 'Hello world' in ASCII values
    expect(base64ToUint8Array(base64String)).toEqual(expectedUint8Array);
  });

  it('should return an empty Uint8Array for an empty Base64 string', () => {
    const base64String = '';
    const expectedUint8Array = new Uint8Array([]);
    expect(base64ToUint8Array(base64String)).toEqual(expectedUint8Array);
  });

  it('should handle non-Base64 strings', () => {
    const nonBase64String = 'This is not a Base64 string';
    expect(() => base64ToUint8Array(nonBase64String)).toThrow();
  });
});

describe('uint8ArrayToBase64', () => {
  it('converts an empty Uint8Array to an empty string', () => {
    const byteArray = new Uint8Array();
    const result = uint8ArrayToBase64(byteArray);
    expect(result).toBe('');
  });

  it('correctly converts a Uint8Array to a base64 string', () => {
    const byteArray = new Uint8Array([104, 101, 108, 108, 111]); // ASCII for "hello"
    const result = uint8ArrayToBase64(byteArray);
    expect(result).toBe('aGVsbG8='); // base64 for "hello"
  });

  it('correctly converts a large Uint8Array to a base64 string', () => {
    const largeArray = new Uint8Array(1024).fill(97); // 1024 bytes all set to ASCII for "a"
    const result = uint8ArrayToBase64(largeArray);
    expect(result).toBe(Buffer.from(largeArray).toString('base64')); // compare with Node's built-in conversion
  });
});
