import { describe, expect, test } from 'vitest';
import { removeTrailingSlash } from './usePagePath.ts';

describe('removeTrailingSlash', () => {
  test('should remove trailing slash when present', () => {
    const url = '/example/';
    const result = removeTrailingSlash(url);
    expect(result).toBe('/example');
  });

  test('should return original string when trailing slash is not present', () => {
    const url = '/example';
    const result = removeTrailingSlash(url);
    expect(result).toBe('/example');
  });

  test('should handle empty strings', () => {
    const url = '';
    const result = removeTrailingSlash(url);
    expect(result).toBe('');
  });

  test('should handle strings with only a slash', () => {
    const url = '/';
    const result = removeTrailingSlash(url);
    expect(result).toBe('');
  });

  test('should not remove slashes that are not at the end', () => {
    const url = '/example/test/';
    const result = removeTrailingSlash(url);
    expect(result).toBe('/example/test');
  });
});
