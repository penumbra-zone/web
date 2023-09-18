import { describe, expect, it } from 'vitest';

import { Base64StringSchema, InnerBase64Schema } from './base64';
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
