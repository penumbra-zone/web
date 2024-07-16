import { DefaultTheme } from 'styled-components';
import { Subvariant, Variant } from './types';

export const getBackgroundColor = (
  variant: Variant,
  subvariant: Subvariant,
  theme: DefaultTheme,
): string => {
  switch (subvariant) {
    case 'strong':
      return theme.color[variant].main;
    case 'subtle':
      return theme.color[variant].dark;
    default:
      return 'transparent';
  }
};
