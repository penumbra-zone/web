import { describe, expect, it } from 'vitest';
import { getBackgroundColor } from './helpers';
import { DefaultTheme } from 'styled-components';

describe('getBackgroundColor()', () => {
  const theme = {
    color: { primary: { main: '#aaa' }, neutral: { main: '#ccc' }, destructive: { main: '#f00' } },
  } as DefaultTheme;

  describe('when `priority` is `primary`', () => {
    it('returns the primary color for the `accent` action type', () => {
      expect(getBackgroundColor('accent', 'primary', theme)).toBe('#aaa');
    });

    it('returns the neutral color for the `default` action type', () => {
      expect(getBackgroundColor('default', 'primary', theme)).toBe('#ccc');
    });

    it('returns the corresponding color for other action types', () => {
      expect(getBackgroundColor('destructive', 'primary', theme)).toBe('#f00');
    });
  });

  describe('when `priority` is `secondary`', () => {
    it('returns `transparent`', () => {
      expect(getBackgroundColor('accent', 'secondary', theme)).toBe('transparent');
    });
  });
});
