import { describe, expect, it } from 'vitest';
import { round, RoundOptions } from './round.js';

describe('round function', () => {
  const testCases: {
    description: string;
    options: RoundOptions;
    expected: string;
  }[] = [
    // Default rounding mode ('half-up')
    {
      description: 'should round up using default rounding (round)',
      options: { value: 1.2345, decimals: 3 },
      expected: '1.235',
    },
    {
      description: 'should round down using default rounding (round)',
      options: { value: 1.2341, decimals: 3 },
      expected: '1.234',
    },
    {
      description: 'should round a negative number using default rounding (round)',
      options: { value: -1.2345, decimals: 2 },
      expected: '-1.23',
    },
    {
      description: 'should round zero',
      options: { value: 0, decimals: 2 },
      expected: '0',
    },
    {
      description: 'should round an integer with decimals',
      options: { value: 5, decimals: 2 },
      expected: '5',
    },
    // Rounding mode: 'up'
    {
      description: 'should ceil to 2 decimals',
      options: { value: 1.2345, decimals: 2, roundingMode: 'up' },
      expected: '1.24',
    },
    {
      description: 'should ceil a negative number',
      options: { value: -1.2345, decimals: 2, roundingMode: 'up' },
      expected: '-1.24',
    },
    {
      description: 'should ceil with zero decimals',
      options: { value: 1.5, decimals: 0, roundingMode: 'up' },
      expected: '2',
    },
    // Rounding mode: 'down'
    {
      description: 'should floor to 2 decimals',
      options: { value: 1.2399, decimals: 2, roundingMode: 'down' },
      expected: '1.23',
    },
    {
      description: 'should floor a negative number',
      options: { value: -1.2345, decimals: 2, roundingMode: 'down' },
      expected: '-1.23',
    },
    {
      description: 'should floor with zero decimals',
      options: { value: 1.9, decimals: 0, roundingMode: 'down' },
      expected: '1',
    },
    // Exponential Notation Test Cases
    {
      description: 'should handle extremely large numbers with round mode',
      options: { value: 5.770789431026099e23, decimals: 4, roundingMode: 'half-up' },
      expected: '5.7708e+23',
    },
    {
      description: 'should handle extremely large numbers with floor mode',
      options: { value: 5.770789431026099e23, decimals: 4, roundingMode: 'down' },
      expected: '5.7707e+23',
    },
    {
      description: 'should handle extremely large numbers with ceil mode',
      options: { value: 5.770789431026099e23, decimals: 4, roundingMode: 'up' },
      expected: '5.7708e+23',
    },
    {
      description: 'should handle extremely large negative numbers',
      options: { value: -5.770789431026099e23, decimals: 4, roundingMode: 'half-up' },
      expected: '-5.7708e+23',
    },
    // Edge Cases
    {
      description: 'should handle large numbers',
      options: { value: 1.23456789e10, decimals: 4, roundingMode: 'half-up' },
      expected: '12345678900',
    },
    {
      description: 'should remove trailing zeros',
      options: { value: 1.0000000001, decimals: 4, roundingMode: 'half-up' },
      expected: '1',
    },
    {
      description: 'should handle very small numbers',
      options: { value: 0.000123456, decimals: 8, roundingMode: 'half-up' },
      expected: '0.00012346',
    },
    {
      description: 'should handle Infinity',
      options: { value: Infinity, decimals: 2, roundingMode: 'half-up' },
      expected: 'Infinity',
    },
    {
      description: 'should handle -Infinity',
      options: { value: -Infinity, decimals: 2, roundingMode: 'down' },
      expected: '-Infinity',
    },
    {
      description: 'should handle NaN',
      options: { value: NaN, decimals: 2, roundingMode: 'up' },
      expected: 'NaN',
    },
    {
      description: 'should handle decimals greater than available decimal places',
      options: { value: 1.2, decimals: 5, roundingMode: 'down' },
      expected: '1.2',
    },
    // Rounding to integer
    {
      description: 'should round to integer using round mode',
      options: { value: 2.5, decimals: 0, roundingMode: 'half-up' },
      expected: '3',
    },
    {
      description: 'should ceil to integer',
      options: { value: 2.1, decimals: 0, roundingMode: 'up' },
      expected: '3',
    },
    {
      description: 'should floor to integer',
      options: { value: 2.9, decimals: 0, roundingMode: 'down' },
      expected: '2',
    },
  ];

  testCases.forEach(({ description, options, expected }) => {
    // eslint-disable-next-line vitest/valid-title
    it(description, () => {
      const result = round(options);
      expect(result).toBe(expected);
    });
  });
});
