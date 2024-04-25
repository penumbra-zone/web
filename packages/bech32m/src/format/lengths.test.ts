import { describe, expect, test } from 'vitest';
import { Prefix } from './prefix';
import { StringLength } from './strings';
import { ByteLength } from './bytes';

const bech32Length = (prefix: string, byteSize: number) =>
  prefix.length +
  1 + // separator is '1'
  Math.ceil(
    (8 / 5) * byteSize,
    // ratio of 8bits/byte to 5bits/char
    // ceil to whole number of chars
  ) +
  6; // checksum is 6 chars

describe('length', () => {
  test('recorded byte sizes are correctly calculated from the recorded string sizes', () =>
    Object.entries(ByteLength).map(([prefix, byteLength]) =>
      expect(bech32Length(prefix, byteLength)).toBe(StringLength[prefix as Prefix]),
    ));
});
