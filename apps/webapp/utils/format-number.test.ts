import { describe, expect, test } from 'vitest';
import { formatNumber } from './format-number';

describe('Format number tests', () => {
  describe('formatNumber()', () => {
    test('a number with decimal places greater than 2 - displays 2 decimal places', () => {
      const numFourDecimals = 12.2945;
      expect(formatNumber(numFourDecimals)).equal('12.29');
    });

    test('a number with 2 decimals - displays 2 decimal places', () => {
      const numTwoDecimals = 1.14;
      expect(formatNumber(numTwoDecimals)).equal('1.14');
    });

    test('a number with 1 decimal - displays 2 decimal places', () => {
      const numOneDecimal = 23.9;
      expect(formatNumber(numOneDecimal)).equal('23.90');
    });

    test('a number greater than 1000 is separated by a thousandth comma', () => {
      const numThreeMillion = 3_000_000;
      expect(formatNumber(numThreeMillion)).equal('3,000,000.00');
    });

    test('a number less than 1 with 6 zero decimals', () => {
      const numThreeMillion = 0.0000001234;
      expect(formatNumber(numThreeMillion)).equal('0.00000012');
    });

    test('a number less than 0', () => {
      const numThreeMillion = -0.05;
      expect(formatNumber(numThreeMillion)).equal('-0.05');
    });

    test('a number less than 0 and zero decimals bigger than 2', () => {
      const numThreeMillion = -0.0005;
      expect(formatNumber(numThreeMillion)).equal('-0.00');
    });
  });
});
