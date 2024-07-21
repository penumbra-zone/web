import { describe, expect, it } from 'vitest';
import { asTransientProps } from './asTransientProps';

describe('asTransientProps()', () => {
  it('converts all properties to have a `$` prefix', () => {
    const props = {
      size: 'lg',
      color: 'red',
    };

    const expected = {
      $size: 'lg',
      $color: 'red',
    };

    expect(asTransientProps(props)).toEqual(expected);
  });
});
