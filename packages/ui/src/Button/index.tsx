import { MouseEventHandler } from 'react';
import styled, { css, DefaultTheme } from 'styled-components';
import { asTransientProps } from '../utils/asTransientProps';
import { Size, Subvariant, Variant } from './types';
import { getBackgroundColor } from './helpers';
import { button } from '../utils/typography';
import { LucideIcon } from 'lucide-react';

const dense = css<StyledButtonProps>`
  border-radius: ${props => props.theme.borderRadius.full};
  padding-left: ${props => props.theme.spacing(props.$iconOnly ? 2 : 4)};
  padding-right: ${props => props.theme.spacing(props.$iconOnly ? 2 : 4)};
  height: 40px;
  min-width: 40px;
`;

const sparse = css`
  border-radius: ${props => props.theme.borderRadius.sm};
  padding-left: ${props => props.theme.spacing(4)};
  padding-right: ${props => props.theme.spacing(4)};
  height: 56px;
  min-width: 56px;
`;

const outlineColorByVariant: Record<Variant, keyof DefaultTheme['color']['action']> = {
  primary: 'primaryFocusOutline',
  secondary: 'secondaryFocusOutline',
  unshield: 'unshieldFocusOutline',
  neutral: 'neutralFocusOutline',
  destructive: 'destructiveFocusOutline',
};

interface StyledButtonProps {
  $iconOnly?: boolean;
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
  outline-offset: -1px;
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
  justify-content: center;
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

interface BaseButtonProps {
  children: string;
  size?: Size;
  variant?: Variant;
  subvariant?: Subvariant;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

interface IconOnlyProps {
  /**
   * When `true`, will render just an icon button. The label text passed via
   * `children` will be used as the `aria-label`.
   */
  iconOnly: true;
  /**
   * The icon import from `lucide-react` to render. If `iconOnly` is `true`, no
   * label will be rendered -- just the icon. Otherwise, the icon will be
   * rendered to the left of the label.
   *
   * ```tsx
   * import { ChevronRight } from 'lucide-react';
   * <Button icon={ChevronRight}>Label</Button>
   * <Button icon={ChevronRight} iconOnly>Label</Button>
   * ```
   */
  icon: LucideIcon;
}

interface RegularProps {
  /**
   * When `true`, will render just an icon button. The label text passed via
   * `children` will be used as the `aria-label`.
   */
  iconOnly?: false;
  /**
   * The icon import from `lucide-react` to render. If `iconOnly` is `true`, no
   * label will be rendered -- just the icon. Otherwise, the icon will be
   * rendered to the left of the label.
   *
   * ```tsx
   * import { ChevronRight } from 'lucide-react';
   * <Button icon={ChevronRight}>Label</Button>
   * <Button icon={ChevronRight} iconOnly>Label</Button>
   * ```
   */
  icon?: LucideIcon;
}

export type ButtonProps = BaseButtonProps & (IconOnlyProps | RegularProps);

export const Button = ({
  children,
  disabled = false,
  onClick,
  icon: IconComponent,
  iconOnly,
  size = 'sparse',
  variant = 'primary',
  subvariant = 'filled',
}: ButtonProps) => {
  return (
    <StyledButton
      {...asTransientProps({ iconOnly, size, variant, subvariant })}
      disabled={disabled}
      onClick={onClick}
      aria-label={children}
    >
      {IconComponent && <IconComponent size={size === 'sparse' ? 24 : 16} />}

      {!iconOnly && children}
    </StyledButton>
  );
};
