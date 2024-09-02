import { css } from 'styled-components';

export type Size = 'lg' | 'md' | 'sm';

export const sizeMap: Record<Size, number> = {
  lg: 32,
  md: 24,
  sm: 16,
};

export const size = css<{ $size: Size }>`
  width: ${props => sizeMap[props.$size]}px;
  height: ${props => sizeMap[props.$size]}px;
`;
