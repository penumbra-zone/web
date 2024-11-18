import { describe, expect, it } from 'vitest';
import { getHumanReadableInterval } from './get-human-readable-interval';

describe('getHumanReadableInterval()', () => {
  it('returns a number of days if the number is cleanly divisible by 60 * 60 * 24', () => {
    expect(getHumanReadableInterval(60 * 60 * 24)).toBe('1d');
    expect(getHumanReadableInterval(60 * 60 * 24 * 10)).toBe('10d');
  });

  it('returns a number of hours if the number is cleanly divisible by 60 * 60', () => {
    expect(getHumanReadableInterval(60 * 60)).toBe('1h');
    expect(getHumanReadableInterval(60 * 60 * 12)).toBe('12h');
  });

  it('returns a number of minutes if the number is cleanly divisible by 60', () => {
    expect(getHumanReadableInterval(60 * 30)).toBe('30m');
    expect(getHumanReadableInterval(60 * 12)).toBe('12m');
  });

  it('returns a number of seconds otherwise', () => {
    expect(getHumanReadableInterval(12)).toBe('12s');
  });

  it('returns combinations when needed', () => {
    expect(getHumanReadableInterval(60 * 60 * 24 * 3 + 60 * 60 * 3 + 60 * 15 + 23)).toBe(
      '3d 3h 15m 23s',
    );

    expect(getHumanReadableInterval(60 * 60 * 3 + 60 * 15 + 23)).toBe('3h 15m 23s');

    expect(getHumanReadableInterval(60 * 15 + 23)).toBe('15m 23s');

    expect(getHumanReadableInterval(60 * 60 * 3 + 23)).toBe('3h 0m 23s');

    expect(getHumanReadableInterval(60 * 60 * 24 * 3 + 23)).toBe('3d 0h 0m 23s');
  });
});
