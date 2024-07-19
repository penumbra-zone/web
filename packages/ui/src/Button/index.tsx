import { MouseEventHandler, useContext } from 'react';
import styled, { css, DefaultTheme } from 'styled-components';
import { asTransientProps } from '../utils/asTransientProps';
import { Size, Variant, ActionType, buttonInteractions } from '../utils/button';
import { getBackgroundColor } from './helpers';
import { button } from '../utils/typography';
import { LucideIcon } from 'lucide-react';
import { ButtonVariantContext } from '../ButtonVariantContext';

const dense = css<StyledButtonProps>`
  border-radius: ${props => props.theme.borderRadius.full};
  padding-left: ${props => props.theme.spacing(props.$iconOnly ? 2 : 4)};
  padding-right: ${props => props.theme.spacing(props.$iconOnly ? 2 : 4)};
  height: 40px;
  min-width: 40px;
`;

const sparse = css<StyledButtonProps>`
  border-radius: ${props => props.theme.borderRadius.sm};
  padding-left: ${props => props.theme.spacing(4)};
  padding-right: ${props => props.theme.spacing(4)};
  height: 56px;
  width: ${props => (props.$iconOnly ? '56px' : '100%')};
`;

const outlineColorByActionType: Record<ActionType, keyof DefaultTheme['color']['action']> = {
  default: 'neutralFocusOutline',
  accent: 'primaryFocusOutline',
  unshield: 'unshieldFocusOutline',
  destructive: 'destructiveFocusOutline',
};

const borderColorByActionType: Record<
  ActionType,
  'neutral' | 'primary' | 'unshield' | 'destructive'
> = {
  default: 'neutral',
  accent: 'primary',
  unshield: 'unshield',
  destructive: 'destructive',
};

interface StyledButtonProps {
  $iconOnly?: boolean;
  $actionType: ActionType;
  $variant: Variant;
  $size: Size;
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
  $getBorderRadius: (theme: DefaultTheme) => string;
}

const StyledButton = styled.button<StyledButtonProps>`
  ${button}

  background-color: ${props => getBackgroundColor(props.$actionType, props.$variant, props.theme)};
  border: none;
  outline: ${props =>
    props.$variant === 'secondary'
      ? `1px solid ${props.theme.color[borderColorByActionType[props.$actionType]].main}`
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

  ${buttonInteractions}

  &::after {
    outline-offset: -2px;
  }
`;

interface BaseButtonProps {
  /**
   * The button label. If `iconOnly` is `true`, this will be used as the
   * `aria-label` attribute.
   */
  children: string;
  /**
   * Set to `sparse` for more loosely arranged layouts, such as when this is the
   * submit button for a form. Use `dense` when, e.g., this button appears next
   * to every item in a dense list of data.
   *
   * Default: `sparse`.
   */
  size?: Size;
  /**
   * What type of action is this button related to? Leave as `default` for most
   * buttons, set to `accent` for the single most important action on a given
   * page, set to `unshield` for actions that will unshield the user's funds,
   * and set to `destructive` for destructive actions.
   *
   * Default: `default`
   */
  actionType?: ActionType;
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

/** A component for all your button needs! */
export const Button = ({
  children,
  disabled = false,
  onClick,
  icon: IconComponent,
  iconOnly,
  size = 'sparse',
  actionType = 'default',
}: ButtonProps) => {
  const variant = useContext(ButtonVariantContext);

  return (
    <StyledButton
      {...asTransientProps({ iconOnly, size, actionType, variant })}
      disabled={disabled}
      onClick={onClick}
      aria-label={iconOnly ? children : undefined}
      $getFocusOutlineColor={theme => theme.color.action[outlineColorByActionType[actionType]]}
      $getBorderRadius={theme => theme.borderRadius.sm}
    >
      {IconComponent && <IconComponent size={size === 'sparse' && iconOnly ? 24 : 16} />}

      {!iconOnly && children}
    </StyledButton>
  );
};
