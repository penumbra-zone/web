import { describe, expect, test } from 'vitest';
import { generateInvalid } from './corrupt';

export const generateTests = <N extends string = 'inner'>(
  prefix: string,
  innerName: N,
  okBytes: Uint8Array,
  okString: string,
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  testToBech32: (x: { [k in N]: Uint8Array }) => string,
  testFromBech32: (x: string) => { [k in N]: Uint8Array },
) => {
  type NamedInner = { [key in N]: Uint8Array };
  describe(`tests for ${prefix}`, () => {
    test('Converts to bech32m', () =>
      expect(testToBech32({ [innerName]: okBytes } as NamedInner)).toBe(okString));

    test('Converts from bech32m', () =>
      expect(testFromBech32(okString)).toMatchObject({ [innerName]: okBytes }));

    const { longBytes, shortBytes, wrongPrefix, longString, shortString, corruptString } =
      generateInvalid(okBytes, okString, innerName);

    test('Throws if data too long', () =>
      expect(() => testToBech32({ [innerName]: longBytes } as unknown as NamedInner)).toThrow());

    test('Throws if data too short', () =>
      expect(() => testToBech32({ [innerName]: shortBytes } as unknown as NamedInner)).toThrow());

    test('Throws if prefix wrong', () => expect(() => testFromBech32(wrongPrefix)).toThrow());

    test('Throws if string too long', () => expect(() => testFromBech32(longString)).toThrow());

    test('Throws if string too short', () => expect(() => testFromBech32(shortString)).toThrow());

    test('Throws if string corrupted', () => expect(() => testFromBech32(corruptString)).toThrow());
  });
};
