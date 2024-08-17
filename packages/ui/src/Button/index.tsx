import { forwardRef, MouseEventHandler } from 'react';
import styled, { css, DefaultTheme } from 'styled-components';
import { asTransientProps } from '../utils/asTransientProps';
import { Priority, focusOutline, overlays, buttonBase } from '../utils/button';
import { getBackgroundColor } from './helpers';
import { button } from '../utils/typography';
import { LucideIcon } from 'lucide-react';
import { Density } from '../types/Density';
import { useDensity } from '../hooks/useDensity';
import { ActionType } from '../utils/ActionType';
import { MotionProp } from '../utils/MotionProp';
import { motion } from 'framer-motion';

const iconOnlyAdornment = css<StyledButtonProps>`
  border-radius: ${props => props.theme.borderRadius.full};
  padding: ${props => props.theme.spacing(1)};
  width: max-content;
`;

const sparse = css<StyledButtonProps>`
  border-radius: ${props => props.theme.borderRadius.sm};
  padding-left: ${props => props.theme.spacing(4)};
  padding-right: ${props => props.theme.spacing(4)};
  height: 48px;
  width: ${props => (props.$iconOnly ? '48px' : '100%')};
`;

const compact = css<StyledButtonProps>`
  border-radius: ${props => props.theme.borderRadius.full};
  padding-left: ${props => props.theme.spacing(props.$iconOnly ? 2 : 4)};
  padding-right: ${props => props.theme.spacing(props.$iconOnly ? 2 : 4)};
  height: 32px;
  min-width: 32px;
  width: max-content;
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
  $iconOnly?: boolean | 'adornment';
  $actionType: ActionType;
  $priority: Priority;
  $density: Density;
  $getFocusOutlineColor: (theme: DefaultTheme) => string;
  $getFocusOutlineOffset?: (theme: DefaultTheme) => string | undefined;
  $getBorderRadius: (theme: DefaultTheme) => string;
}

const StyledButton = styled(motion.button)<StyledButtonProps>`
  ${buttonBase}
  ${button}

  background-color: ${props =>
    getBackgroundColor(props.$actionType, props.$priority, props.theme, props.$iconOnly)};
  outline: ${props =>
    props.$priority === 'secondary'
      ? `1px solid ${props.theme.color[borderColorByActionType[props.$actionType]].main}`
      : 'none'};
  outline-offset: -1px;
  display: flex;
  gap: ${props => props.theme.spacing(2)};
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.color.neutral.contrast};
  position: relative;

  ${props =>
    props.$iconOnly === 'adornment'
      ? iconOnlyAdornment
      : props.$density === 'sparse'
        ? sparse
        : compact}

  &::after {
    outline-offset: -2px;
  }

  ${focusOutline}
  ${overlays}
`;

interface BaseButtonProps {
  type?: HTMLButtonElement['type'];
  /**
   * The button label. If `iconOnly` is `true` or `adornment`, this will be used
   * as the `aria-label` attribute.
   */
  children: string;
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
  priority?: Priority;
}

interface IconOnlyProps {
  /**
   * When set to `true`, will render just an icon button. When set to
   * `adornment`, will render an icon button without the fill or outline of a
   * normal button. This latter case is useful when the button is an adornment
   * to another component (e.g., when it's a copy icon attached to an
   * `AddressViewComponent`).
   *
   * In both of these cases, the label text passed via `children` will be used
   * as the `aria-label`.
   *
   * Note that, when `iconOnly` is `adornment`, density has no impact on the
   * button: it will render at the same size in either a `compact` or `sparse`
   * context.
   */
  iconOnly: true | 'adornment';
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

export type ButtonProps = BaseButtonProps & (IconOnlyProps | RegularProps) & MotionProp;

/**
 * A component for all your button needs!
 *
 * See individual props for how to use `<Button />` in various forms.
 *
 * Note that, to use `<Button />` as a link, you can simply wrap it in an anchor
 * (`<a />`) tag (or `<Link />`, if you're using e.g., React Router) and leave
 * `onClick` undefined.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      disabled = false,
      onClick,
      icon: IconComponent,
      iconOnly,
      actionType = 'default',
      type = 'button',
      priority = 'primary',
      motion,
    },
    ref,
  ) => {
    const density = useDensity();

    return (
      <StyledButton
        {...asTransientProps({ iconOnly, density, actionType, priority })}
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        aria-label={iconOnly ? children : undefined}
        title={iconOnly ? children : undefined}
        $getFocusOutlineColor={theme => theme.color.action[outlineColorByActionType[actionType]]}
        $getFocusOutlineOffset={() => (iconOnly === 'adornment' ? '0px' : undefined)}
        $getBorderRadius={theme =>
          density === 'sparse' && iconOnly !== 'adornment'
            ? theme.borderRadius.sm
            : theme.borderRadius.full
        }
        {...motion}
      >
        {IconComponent && (
          <IconComponent size={density === 'sparse' && iconOnly === true ? 24 : 16} />
        )}

        {!iconOnly && children}
      </StyledButton>
    );
  },
);
Button.displayName = 'Button';
