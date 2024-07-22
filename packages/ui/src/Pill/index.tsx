import styled from 'styled-components';
import { asTransientProps } from '../utils/asTransientProps';
import { ReactNode } from 'react';
import { button } from '../utils/typography';

type Size = 'sparse' | 'dense';
type Variant = 'primary' | 'secondary';

const TEN_PERCENT_OPACITY_IN_HEX = '1a';

const Root = styled.span<{ $size: Size; $variant: Variant }>`
  ${button}

  box-sizing: border-box;
  border: 2px dashed
    ${props =>
      props.$variant === 'secondary' ? props.theme.color.other.tonalStroke : 'transparent'};
  border-radius: ${props => props.theme.borderRadius.full};

  display: inline-block;

  padding-top: ${props => props.theme.spacing(props.$size === 'sparse' ? 2 : 1)};
  padding-bottom: ${props => props.theme.spacing(props.$size === 'sparse' ? 2 : 1)};

  padding-left: ${props => props.theme.spacing(props.$size === 'sparse' ? 4 : 2)};
  padding-right: ${props => props.theme.spacing(props.$size === 'sparse' ? 4 : 2)};

  background-color: ${props => props.theme.color.text.primary + TEN_PERCENT_OPACITY_IN_HEX};
`;

export interface PillProps {
  children: ReactNode;
  size?: Size;
  variant?: Variant;
}

export const Pill = ({ children, size = 'sparse', variant = 'primary' }: PillProps) => (
  <Root {...asTransientProps({ size, variant })}>{children}</Root>
);
