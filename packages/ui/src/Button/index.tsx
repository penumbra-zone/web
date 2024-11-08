import { FC, forwardRef, MouseEventHandler, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import cn from 'clsx';
import { getOutlineColorByActionType, ActionType } from '../utils/action-type';
import { Priority, buttonBase, getBackground, getFocusOutline, getOverlays } from '../utils/button';
import { button } from '../utils/typography';
import { useDensity } from '../utils/density';

const iconOnlyAdornment = cn('rounded-full p-1 w-max');
const sparse = (iconOnly?: boolean | 'adornment') =>
  cn('rounded-sm h-12', iconOnly ? 'w-12 min-w-12 pl-0 pr-0' : 'w-full pl-4 pr-4');

const compact = (iconOnly?: boolean | 'adornment') =>
  cn('rounded-full h-8 min-w-8 w-max', iconOnly ? 'pl-2 pr-2' : 'pl-4 pr-4');

interface BaseButtonProps {
  type?: HTMLButtonElement['type'];
  /**
   * The button label. If `iconOnly` is `true` or `adornment`, this will be used
   * as the `aria-label` attribute.
   */
  children: ReactNode;
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
  icon: LucideIcon | FC;
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
  icon?: LucideIcon | FC;
}

export type ButtonProps = BaseButtonProps & (IconOnlyProps | RegularProps);

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
      ...attrs
      // needed for the Radix's `asChild` prop to work correctly
      // https://www.radix-ui.com/primitives/docs/guides/composition#composing-with-your-own-react-components
    },
    ref,
  ) => {
    const density = useDensity();

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        aria-label={iconOnly && typeof children === 'string' ? children : undefined}
        title={iconOnly && typeof children === 'string' ? children : undefined}
        {...attrs}
        className={cn(
          buttonBase,
          button,
          getBackground(actionType, priority, iconOnly),
          getFocusOutline({ density, iconOnly, actionType }),
          getOverlays({ actionType, iconOnly, density }),

          '-outline-offset-1',
          priority === 'secondary' && 'outline-1',
          priority === 'secondary' && getOutlineColorByActionType(actionType),
          'after:-outline-offset-2',

          'relative',
          'flex gap-2 items-center justify-center',
          'text-neutral-contrast',

          // eslint-disable-next-line no-nested-ternary -- allow
          iconOnly === 'adornment'
            ? iconOnlyAdornment
            : density === 'sparse'
              ? sparse(iconOnly)
              : compact(iconOnly),
        )}
      >
        {IconComponent && (
          <IconComponent size={density === 'sparse' && iconOnly === true ? 24 : 16} />
        )}

        {!iconOnly && children}
      </button>
    );
  },
);
Button.displayName = 'Button';
