import { describe, expect, test } from 'vitest';
import { parseIntoAddr } from './address.js';

describe('parseIntoAddr', () => {
  test('works with normal addresses', () => {
    expect(() =>
      parseIntoAddr(
        'penumbra1e8k5cyds484dxvapeamwveh5khqv4jsvyvaf5wwxaaccgfghm229qw03pcar3ryy8smptevstycch0qk3uu0rgkvtjpxy3cu3rjd0agawqtlz6erev28a6sg69u7cxy0t02nd4',
      ),
    ).not.toThrow();
  });

  test('raises on invalid addresses', () => {
    expect(() => parseIntoAddr('not_valid_format')).toThrow();
  });
});
