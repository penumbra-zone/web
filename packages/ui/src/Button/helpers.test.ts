import { describe, expect, it } from 'vitest';
import { getBackgroundColor } from './helpers';
import { DefaultTheme } from 'styled-components';

describe('getBackgroundColor()', () => {
  const theme = { color: { primary: { main: '#f00', dark: '#a00' } } } as DefaultTheme;

  it('returns the main color for the `strong` subvariant', () => {
    expect(getBackgroundColor('primary', 'strong', theme)).toBe('#f00');
  });

  it('returns the dark color for the `subtle` subvariant', () => {
    expect(getBackgroundColor('primary', 'subtle', theme)).toBe('#a00');
  });

  it('returns `transparent` for the `outlined` subvariant', () => {
    expect(getBackgroundColor('primary', 'outlined', theme)).toBe('transparent');
  });
});
