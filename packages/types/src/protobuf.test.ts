import { describe, expect, it } from 'vitest';
import { typeUrlMatchesTypeName } from './protobuf';

describe('typeUrlMatchesTypeName()', () => {
  it('returns `true` if the type URL is equal to the type name with a leading slash', () => {
    expect(typeUrlMatchesTypeName('/foo', 'foo')).toBe(true);
  });

  it('returns `false` if the type URL is not equal to the type name with a leading slash', () => {
    expect(typeUrlMatchesTypeName('/foo', 'bar')).toBe(false);
  });

  it('returns `false` if the type URL is undefined', () => {
    expect(typeUrlMatchesTypeName(undefined, 'foo')).toBe(false);
  });

  it('returns `false` if the type name is undefined', () => {
    expect(typeUrlMatchesTypeName('/foo', undefined)).toBe(false);
  });
});
