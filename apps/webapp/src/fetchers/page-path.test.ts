import { describe, expect, test } from 'vitest';
import { matchPagePath, removeTrailingSlash } from './page-path.ts';
import { PagePath } from '../components/metadata/paths.ts';

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

describe('matchPagePath', () => {
  test('should match exact paths', () => {
    expect(matchPagePath('/')).toBe(PagePath.INDEX);
    expect(matchPagePath('/swap')).toBe(PagePath.SWAP);
    expect(matchPagePath('/send')).toBe(PagePath.SEND);
  });

  test('should match paths with variable parts', () => {
    expect(matchPagePath('/tx/123')).toBe(PagePath.TRANSACTION_DETAILS);
    expect(matchPagePath('/tx/abc')).toBe(PagePath.TRANSACTION_DETAILS);
    expect(matchPagePath('/tx/abc123')).toBe(PagePath.TRANSACTION_DETAILS);
  });

  test('should throw an error for unmatched paths', () => {
    expect(() => matchPagePath('/unmatched')).toThrowError('No match found for path: /unmatched');
    expect(() => matchPagePath('/tx/')).toThrowError('No match found for path: /tx/');
    expect(() => matchPagePath('/tx/123/abc')).toThrowError('No match found for path: /tx/123/abc');
  });
});
