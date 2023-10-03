import { describe, expect, test } from 'vitest';
import { validateAmount, validateRecipient } from './validation';

describe('Validation tests', () => {
  describe('validateAmount()', () => {
    test('if the amount is greater than the balance, the result is true', () => {
      const amount = '20';
      const balance = 10;
      expect(validateAmount(amount, balance)).toBeTruthy();
    });

    test('if the balance is greater than the amount, the result is false', () => {
      const amount = '10';
      const balance = 20;
      expect(validateAmount(amount, balance)).toBeFalsy();
    });

    test('if the balance and amount are equal, the result is false', () => {
      const amount = '20';
      const balance = 20;
      expect(validateAmount(amount, balance)).toBeFalsy();
    });
  });

  describe('validateRecipient()', () => {
    test('if the adddress is right, the result is false', () => {
      const rightAddress =
        'penumbrav2t1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4';
      expect(validateRecipient(rightAddress)).toBeFalsy();
    });

    test('if the address has incorect length, the result is true', () => {
      const incorectLengthAddress =
        'penumbrav2t1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6';
      expect(validateRecipient(incorectLengthAddress)).toBeTruthy();
    });

    test('if the address has incorect prefix, the result is true', () => {
      const incorectPrefixAddress =
        'wwwwwwwwww1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4d';
      expect(validateRecipient(incorectPrefixAddress)).toBeTruthy();
    });
  });
});
