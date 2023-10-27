import { describe, expect, it } from 'vitest';
import { addLoHi, convertFromBaseUnit, joinLoHi, splitLoHi } from './lo-hi';

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

  describe('convertFromBaseUnit', () => {
    it('applies positive exponent', () => {
      const result = convertFromBaseUnit(1000n, 0n, 3);
      expect(result).toBe(1);
    });

    it('handles high and low bits', () => {
      const result = convertFromBaseUnit(1000n, 5n, 6);
      expect(result).toBe(92233720368547.77);
    });

    it('handles exponent of 0', () => {
      const result = convertFromBaseUnit(1000n, 0n, 0);
      expect(result).toBe(1000);
    });

    it('handles big numbers', () => {
      const result = convertFromBaseUnit(123456789012345n, 987654321098765n, 30);
      expect(result).toBe(18219.006494602272);
    });

    it('should return less than 1', () => {
      const result = convertFromBaseUnit(7n, 0n, 12);

      expect(result).toBe(0.000000000007);
    });
  });
});
