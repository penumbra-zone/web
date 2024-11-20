import { describe, expect, it } from 'vitest';
import { removeTrailingZeros, shortify } from './shortify.js';

describe('shortify Function', () => {
  describe('No suffix needed (|value| < 1,000)', () => {
    it('should return the integer part for positive numbers', () => {
      expect(shortify(0)).toBe('0');
      expect(shortify(999)).toBe('999');
      expect(shortify(999.9999)).toBe('999');
      expect(shortify(99.9999)).toBe('99.9');
      expect(shortify(9.9999)).toBe('9.99');
      expect(shortify(123.456)).toBe('123'); // floor rounding
    });

    it('should return the integer part for negative numbers', () => {
      expect(shortify(-999)).toBe('-999');
      expect(shortify(-123.456)).toBe('-123'); // ceil rounding
    });
  });

  describe('Thousands suffix (K)', () => {
    it('should format positive numbers correctly', () => {
      expect(shortify(1000)).toBe('1K');
      expect(shortify(1500)).toBe('1.5K');
      expect(shortify(999999)).toBe('999K');
      expect(shortify(1234)).toBe('1.23K');
      expect(shortify(12345)).toBe('12.3K');
      expect(shortify(123456)).toBe('123K');
    });

    it('should format negative numbers correctly', () => {
      expect(shortify(-1000)).toBe('-1K');
      expect(shortify(-1500)).toBe('-1.5K');
      expect(shortify(-999999)).toBe('-999K');
      expect(shortify(-1234)).toBe('-1.23K');
      expect(shortify(-12345)).toBe('-12.3K');
      expect(shortify(-123456)).toBe('-123K');
    });
  });

  describe('Millions suffix (M)', () => {
    it('should format positive numbers correctly', () => {
      expect(shortify(1_000_000)).toBe('1M');
      expect(shortify(1_500_000)).toBe('1.5M');
      expect(shortify(999_999_999)).toBe('999M');
      expect(shortify(1234567)).toBe('1.23M');
      expect(shortify(12345678)).toBe('12.3M');
      expect(shortify(123456789)).toBe('123M');
    });

    it('should format negative numbers correctly', () => {
      expect(shortify(-1_000_000)).toBe('-1M');
      expect(shortify(-1_500_000)).toBe('-1.5M');
      expect(shortify(-999_999_999)).toBe('-999M');
      expect(shortify(-1234567)).toBe('-1.23M');
      expect(shortify(-12345678)).toBe('-12.3M');
      expect(shortify(-123456789)).toBe('-123M');
    });
  });

  describe('Billions suffix (B)', () => {
    it('should format positive numbers correctly', () => {
      expect(shortify(1_000_000_000)).toBe('1B');
      expect(shortify(1_500_000_000)).toBe('1.5B');
      expect(shortify(999_999_999_999)).toBe('999B');
      expect(shortify(1234567890)).toBe('1.23B');
      expect(shortify(12345678901)).toBe('12.3B');
      expect(shortify(123456789012)).toBe('123B');
    });

    it('should format negative numbers correctly', () => {
      expect(shortify(-1_000_000_000)).toBe('-1B');
      expect(shortify(-1_500_000_000)).toBe('-1.5B');
      expect(shortify(-999_999_999_999)).toBe('-999B');
      expect(shortify(-1234567890)).toBe('-1.23B');
      expect(shortify(-12345678901)).toBe('-12.3B');
      expect(shortify(-123456789012)).toBe('-123B');
    });
  });

  describe('Trillions suffix (T)', () => {
    it('should format positive numbers correctly', () => {
      expect(shortify(1_000_000_000_000)).toBe('1T');
      expect(shortify(1_500_000_000_000)).toBe('1.5T');
      expect(shortify(1234567890123)).toBe('1.23T');
      expect(shortify(12345678901234)).toBe('12.3T');
      expect(shortify(123456789012345)).toBe('123T');
      expect(shortify(1e15)).toBe('1000T'); // Edge case: beyond trillion
    });

    it('should format negative numbers correctly', () => {
      expect(shortify(-1_000_000_000_000)).toBe('-1T');
      expect(shortify(-1_500_000_000_000)).toBe('-1.5T');
      expect(shortify(-1234567890123)).toBe('-1.23T');
      expect(shortify(-12345678901234)).toBe('-12.3T');
      expect(shortify(-123456789012345)).toBe('-123T');
      expect(shortify(-1e15)).toBe('-1000T'); // Edge case: beyond trillion
    });
  });

  describe('Trailing zeros removal', () => {
    it('should remove trailing zeros after decimal', () => {
      expect(shortify(1000)).toBe('1K');
      expect(shortify(1200)).toBe('1.2K');
      expect(shortify(1230)).toBe('1.23K');
      expect(shortify(1000000)).toBe('1M');
      expect(shortify(1200000)).toBe('1.2M');
      expect(shortify(1230000)).toBe('1.23M');
      expect(shortify(1000000000)).toBe('1B');
      expect(shortify(1200000000)).toBe('1.2B');
      expect(shortify(1230000000)).toBe('1.23B');
      expect(shortify(1000000000000)).toBe('1T');
      expect(shortify(1200000000000)).toBe('1.2T');
      expect(shortify(1230000000000)).toBe('1.23T');

      expect(shortify(-1000)).toBe('-1K');
      expect(shortify(-1200)).toBe('-1.2K');
      expect(shortify(-1230)).toBe('-1.23K');
      expect(shortify(-1000000)).toBe('-1M');
      expect(shortify(-1200000)).toBe('-1.2M');
      expect(shortify(-1230000)).toBe('-1.23M');
      expect(shortify(-1000000000)).toBe('-1B');
      expect(shortify(-1200000000)).toBe('-1.2B');
      expect(shortify(-1230000000)).toBe('-1.23B');
      expect(shortify(-1000000000000)).toBe('-1T');
      expect(shortify(-1200000000000)).toBe('-1.2T');
      expect(shortify(-1230000000000)).toBe('-1.23T');
    });
  });

  describe('Very large numbers beyond trillion', () => {
    it('should handle numbers larger than 1 trillion', () => {
      expect(shortify(1_500_000_000_000)).toBe('1.5T');
      expect(shortify(12_345_678_901_234)).toBe('12.3T');
      expect(shortify(123_456_789_012_345)).toBe('123T');
      expect(shortify(999_999_999_999_999)).toBe('999T');
      expect(shortify(1e15)).toBe('1000T');
      expect(shortify(-1_500_000_000_000)).toBe('-1.5T');
      expect(shortify(-12_345_678_901_234)).toBe('-12.3T');
      expect(shortify(-123_456_789_012_345)).toBe('-123T');
      expect(shortify(-999_999_999_999_999)).toBe('-999T');
      expect(shortify(-1e15)).toBe('-1000T');
    });
  });

  describe('Rounding behavior', () => {
    it('should floor positive numbers and ceil negative numbers', () => {
      // Positive numbers
      expect(shortify(1234)).toBe('1.23K'); // floor to 2 decimals
      expect(shortify(12345)).toBe('12.3K'); // floor to 1 decimal
      expect(shortify(123456)).toBe('123K'); // floor to 0 decimals

      // Negative numbers
      expect(shortify(-1234)).toBe('-1.23K'); // ceil to 2 decimals
      expect(shortify(-12345)).toBe('-12.3K'); // ceil to 1 decimal
      expect(shortify(-123456)).toBe('-123K'); // ceil to 0 decimals
    });
  });
});

describe('removeTrailingZeros', () => {
  it('should remove trailing zeros after decimal point', () => {
    expect(removeTrailingZeros('123.45000')).toBe('123.45');
    expect(removeTrailingZeros('0.5000')).toBe('0.5');
    expect(removeTrailingZeros('3.14159000')).toBe('3.14159');
  });

  it('should remove decimal point if all decimal digits are zeros', () => {
    expect(removeTrailingZeros('123.000')).toBe('123');
    expect(removeTrailingZeros('0.0000')).toBe('0');
    expect(removeTrailingZeros('456.0')).toBe('456');
  });

  it('should handle numbers without decimal points', () => {
    expect(removeTrailingZeros('123')).toBe('123');
    expect(removeTrailingZeros('0')).toBe('0');
    expect(removeTrailingZeros('456789')).toBe('456789');
  });

  it('should handle numbers with no trailing zeros', () => {
    expect(removeTrailingZeros('123.45')).toBe('123.45');
    expect(removeTrailingZeros('0.5')).toBe('0.5');
    expect(removeTrailingZeros('789.123456')).toBe('789.123456');
  });

  it('should handle negative numbers', () => {
    expect(removeTrailingZeros('-123.45000')).toBe('-123.45');
    expect(removeTrailingZeros('-0.000')).toBe('-0');
    expect(removeTrailingZeros('-456')).toBe('-456');
  });

  it('should handle empty string gracefully', () => {
    expect(removeTrailingZeros('')).toBe('');
  });

  it('should handle very large numbers', () => {
    expect(removeTrailingZeros('12345678901234567890.000000')).toBe('12345678901234567890');
    expect(removeTrailingZeros('9876543210.09876543210000')).toBe('9876543210.0987654321');
  });

  it('should handle numbers with leading zeros', () => {
    expect(removeTrailingZeros('000123.45000')).toBe('000123.45');
    expect(removeTrailingZeros('000.000')).toBe('000');
    expect(removeTrailingZeros('000456')).toBe('000456');
  });

  it('should handle numbers with no digits after decimal point', () => {
    expect(removeTrailingZeros('123.')).toBe('123.');
    expect(removeTrailingZeros('-456.')).toBe('-456.');
  });
});
