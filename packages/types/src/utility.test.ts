import { describe, expect, it } from 'vitest';
import { camelToSnakeCase } from './utility';

describe('camelToSnakeCase()', () => {
  it('converts camelCase to snake_case', () => {
    expect(camelToSnakeCase('needsToBeConverted')).toBe('needs_to_be_converted');
  });
});
