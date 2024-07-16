import { MouseEventHandler, ReactNode } from 'react';
import styled, { css, DefaultTheme } from 'styled-components';
import { asTransientProps } from '../utils/asTransientProps';
import { Size, Subvariant, Variant } from './types';
import { getBackgroundColor } from './helpers';
import { button } from '../utils/typography';

const dense = css`
  border-radius: ${props => props.theme.borderRadius.full};
  padding-left: ${props => props.theme.spacing(4)};
  padding-right: ${props => props.theme.spacing(4)};
  padding-top: ${props => props.theme.spacing(2)};
  padding-bottom: ${props => props.theme.spacing(2)};
`;

const sparse = css`
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: ${props => props.theme.spacing(4)};
`;

const outlineColorByVariant: Record<Variant, keyof DefaultTheme['color']['action']> = {
  primary: 'primaryFocusOutline',
  secondary: 'secondaryFocusOutline',
  unshield: 'unshieldFocusOutline',
  neutral: 'neutralFocusOutline',
  destructive: 'destructiveFocusOutline',
};

interface StyledButtonProps {
  $variant: Variant;
  $subvariant: Subvariant;
  $size: Size;
}

const StyledButton = styled.button<StyledButtonProps>`
  ${button}

  background-color: ${props => getBackgroundColor(props.$variant, props.$subvariant, props.theme)};
  border: none;
  outline: ${props =>
    props.$subvariant === 'outlined'
      ? `1px solid ${props.theme.color[props.$variant].main}`
      : 'none'};
  box-sizing: border-box;
  color: ${props => props.theme.color.neutral.contrast};
  cursor: pointer;
  overflow: hidden;
  position: relative;

  ${props => (props.$size === 'dense' ? dense : sparse)}

  &:hover::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${props => props.theme.color.action.hoverOverlay};
    z-index: 1;
  }

  &:active::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${props => props.theme.color.action.activeOverlay};
    z-index: 1;
  }

  &:focus {
    outline: 2px solid ${props => props.theme.color.action[outlineColorByVariant[props.$variant]]};
  }

  &:disabled::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${props => props.theme.color.action.disabledOverlay};
    z-index: 1;

    cursor: not-allowed;
  }
`;

export interface ButtonProps {
  children?: ReactNode;
  size?: Size;
  variant?: Variant;
  subvariant?: Subvariant;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const Button = ({
  children,
  disabled,
  onClick,
  size = 'sparse',
  variant = 'primary',
  subvariant = 'strong',
}: ButtonProps) => {
  return (
    <StyledButton
      {...asTransientProps({ size, variant, subvariant })}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </StyledButton>
  );
};
