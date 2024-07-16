import { DefaultTheme } from 'styled-components';
import { Subvariant, Variant } from './types';

export const getBackgroundColor = (
  variant: Variant,
  subvariant: Subvariant,
  theme: DefaultTheme,
): string => (subvariant === 'filled' ? theme.color[variant].main : 'transparent');
