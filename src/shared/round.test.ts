import { describe, expect, test } from 'vitest';
import { round } from './round';

describe('round()', () => {
  test('should round numbers correctly', () => {
    expect(round(1.0005, 3)).toBe('1.001');
    expect(round(1.00049, 3)).toBe('1.000');
    expect(round(1.2345, 2)).toBe('1.23');
    expect(round(1.2355, 2)).toBe('1.24');
  });

  test('should handle negative numbers', () => {
    expect(round(-1.2345, 2)).toBe('-1.23');
  });

  test('should handle zero', () => {
    expect(round(1, 5)).toBe('1.00000');
    expect(round(0, 2)).toBe('0.00');
  });

  test('should handle large numbers', () => {
    expect(round(123456789012345.89, 1)).toBe('123456789012345.9');
  });

  test('should handle different decimal places', () => {
    expect(round(3.14159, 0)).toBe('3');
    expect(round(3.14159, 1)).toBe('3.1');
    expect(round(3.14159, 4)).toBe('3.1416');
  });
});
