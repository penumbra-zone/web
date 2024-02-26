import { describe, expect, it } from 'vitest';
import { addLoHi, fromBaseUnit, joinLoHi, splitLoHi, toBaseUnit } from './lo-hi';
import { BigNumber } from 'bignumber.js';

describe('lo-hi', () => {
  describe('splitLoHi', () => {
    it('should correctly split a 128-bit number into two 64-bit numbers', () => {
      const value = 18446744073709551615n + (18446744073709551615n << 64n);
      const result = splitLoHi(value);

      expect(result.lo).toBe(18446744073709551615n);
      expect(result.hi).toBe(18446744073709551615n);
    });

    it('should correctly handle zero', () => {
      const result = splitLoHi(0n);

      expect(result.lo).toBe(0n);
      expect(result.hi).toBe(0n);
    });

    it('should correctly handle a number less than 2^64', () => {
      const result = splitLoHi(1234567890n);

      expect(result.lo).toBe(1234567890n);
      expect(result.hi).toBe(0n);
    });

    it('should correctly handle a number with non-zero high and zero low', () => {
      const result = splitLoHi(1234567890n << 64n);

      expect(result.hi).toBe(1234567890n);
      expect(result.lo).toBe(0n);
    });

    it('should correctly split the low bits when no splitting is required', () => {
      const value = 0xfedcba9876543210n;
      const { lo } = splitLoHi(value);

      expect(lo).toBe(value);
    });
  });

  describe('joinLoHi', () => {
    it('should correctly join two 64-bit numbers into a 128-bit number', () => {
      const lo = 18446744073709551615n;
      const hi = 18446744073709551615n;
      const result = joinLoHi(lo, hi);

      expect(result).toBe((hi << 64n) + lo);
      expect(result).toBe(340282366920938463463374607431768211455n);
    });

    it('should correctly handle zero', () => {
      const result = joinLoHi(0n, 0n);
      expect(result).toBe(0n);

      const passingNone = joinLoHi();
      expect(passingNone).toBe(0n);
    });

    it('should correctly handle a number less than 2^64', () => {
      const result = joinLoHi(1234567890n, 0n);
      expect(result).toBe(1234567890n);
    });

    it('should correctly join a lo value with no hi value', () => {
      const lo = 123456789n;
      expect(joinLoHi(lo)).toEqual(lo);
    });
  });

  describe('splitLoHi and joinLoHi', () => {
    it('should be able to recover the original number after splitting and joining', () => {
      const original = (18446744073709551615n + 18446744073709551615n) << 64n;
      const split = splitLoHi(original);
      const recovered = joinLoHi(split.lo, split.hi);

      expect(recovered).toBe(original);
    });

    it('should be able to recover random 128-bit numbers after splitting and joining', () => {
      for (let i = 0; i < 1000; i++) {
        const original =
          BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) +
          (BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) << 64n);
        const split = splitLoHi(original);
        const recovered = joinLoHi(split.lo, split.hi);

        expect(recovered).toBe(original);
      }
    });
  });

  describe('addLoHi', () => {
    it('adds zero amounts', () => {
      const a = { lo: 0n, hi: 0n };
      const b = { lo: 0n, hi: 0n };

      expect(addLoHi(a, b)).toEqual({ lo: 0n, hi: 0n });
    });

    it('adds with no carry', () => {
      const a = { lo: 123456789n, hi: 987654321n };
      const b = { lo: 9876543210n, hi: 1234567890n };

      expect(addLoHi(a, b)).toEqual({ lo: 9999999999n, hi: 2222222211n });
    });

    it('add results in a carry from the lo to the hi', () => {
      const a = { lo: 0xffffffffffffffffn, hi: 0n };
      const b = { lo: 1n, hi: 0n };

      expect(addLoHi(a, b)).toEqual({ lo: 0n, hi: 1n });
    });

    it('should handle large hi values', () => {
      const a = { lo: 0n, hi: 0xffffffffffffffffn };
      const b = { lo: 0n, hi: 1n };

      expect(addLoHi(a, b)).toEqual({ lo: 0n, hi: 0x10000000000000000n });
    });

    it('should handle large lo and hi values', () => {
      const a = { lo: 0xffffffffffffffffn, hi: 0xffffffffffffffffn };
      const b = { lo: 1n, hi: 1n };

      expect(addLoHi(a, b)).toEqual({ lo: 0n, hi: 0x10000000000000001n });
    });
  });

  describe('fromBaseUnit', () => {
    it('applies positive exponent', () => {
      const result = fromBaseUnit(1000n, 0n, 3);
      expect(result.toString()).toBe('1');
    });

    it('handles high and low bits', () => {
      const result = fromBaseUnit(1000n, 5n, 6);
      expect(result.toString()).toBe('92233720368547.75908');
    });

    it('handles exponent of 0', () => {
      const result = fromBaseUnit(1000n, 0n, 0);
      expect(result.toString()).toBe('1000');
    });

    it('handles big numbers', () => {
      const result = fromBaseUnit(123456789012345n, 987654321098765n, 30);
      expect(result.toString()).toBe('18219.00649460227383107831');
    });

    it('should return less than 1', () => {
      const result = fromBaseUnit(7n, 0n, 12);
      expect(result.toString()).toBe('0.000000000007');
    });

    it('uses exponential notation if big/small enough', () => {
      const result = fromBaseUnit(7n, 0n, 20);
      expect(result.toString()).toBe('7e-20');
    });
  });

  describe('toBaseUnit', () => {
    it('returns correct LoHi for integer value and exponent 0', () => {
      const result = toBaseUnit(BigNumber(12345), 0);
      expect(result.lo).toBe(12345n);
      expect(result.hi).toBe(0n);
    });

    it('should correctly convert to base unit', () => {
      const result = toBaseUnit(BigNumber(123.456), 3);
      expect(result.lo).toBe(123456n);
      expect(result.hi).toBe(0n);
    });

    it('returns correct LoHi for integer value and positive exponent', () => {
      const result = toBaseUnit(BigNumber(12345), 2);
      expect(result.lo).toBe(1234500n);
      expect(result.hi).toBe(0n);
    });

    it('returns correct LoHi for large value and positive exponent', () => {
      const result = toBaseUnit(BigNumber(1234567.13314), 9);
      expect(joinLoHi(result.lo, result.hi)).toBe(1234567133140000n);
    });

    it('handles max safe integer', () => {
      const max = Number.MAX_SAFE_INTEGER;
      const result = toBaseUnit(BigNumber(max), 0);
      expect(result.lo).toEqual(BigInt(max));
      expect(result.hi).toBe(0n);
    });

    it('returns correct LoHi for large value and zero exponent', () => {
      const result = toBaseUnit(BigNumber(1234567891234567), 0);
      const expectedValue = BigInt(1234567891234567);
      expect(joinLoHi(result.lo, result.hi)).toEqual(expectedValue);
    });

    it('returns correct LoHi for large value and 18 exponent', () => {
      const result = toBaseUnit(BigNumber(1234567891234567), 18);
      const expectedValue = BigInt('1234567891234567000000000000000000');
      expect(joinLoHi(result.lo, result.hi)).toEqual(expectedValue);
    });
  });
});
