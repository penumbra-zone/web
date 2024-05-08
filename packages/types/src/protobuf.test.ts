import { describe, expect, it } from 'vitest';
import { typeUrlMatchesTypeName, unpackAny } from './protobuf';
import { Any } from '@bufbuild/protobuf';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

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

describe('unpackAny()', () => {
  it('returns an object unpacked to the given type', () => {
    const expected = new Amount({ hi: 0n, lo: 1n });
    const any = new Any({
      value: expected.toBinary(),
    });
    const result = unpackAny(any, Amount);

    console.log(result);

    expect(result?.equals(expected)).toBe(true);
  });
});
