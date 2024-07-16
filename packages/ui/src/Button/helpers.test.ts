import { describe, expect, it } from 'vitest';
import { getBackgroundColor } from './helpers';
import { DefaultTheme } from 'styled-components';

describe('getBackgroundColor()', () => {
  const theme = { color: { primary: { main: '#f00' } } } as DefaultTheme;

  it('returns the main color for the `filled` subvariant', () => {
    expect(getBackgroundColor('primary', 'filled', theme)).toBe('#f00');
  });

  it('returns `transparent` for the `outlined` subvariant', () => {
    expect(getBackgroundColor('primary', 'outlined', theme)).toBe('transparent');
  });
});
