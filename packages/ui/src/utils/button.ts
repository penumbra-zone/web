import cn from 'clsx';
import type { Density } from './density';
import {
  getAfterOutlineColorByActionType,
  getBeforeOutlineColorByActionType,
  ActionType,
  getBackgroundColorByActionType,
} from './action-type';

export type Priority = 'primary' | 'secondary';

interface ButtonStyleAttributes {
  density: Density;
  iconOnly?: boolean | 'adornment';
  actionType: ActionType;
}

/** Shared styles to use for any `<button />` */
export const buttonBase = cn('appearance-none border-none text-inherit cursor-pointer p-0');

export const getFocusOutline = ({ density, iconOnly, actionType }: ButtonStyleAttributes) =>
  cn(
    'relative',

    // :after styles
    'after:content-[""] after:absolute after:inset-0 after:z-[1] after:outline-2 after:outline after:outline-transparent after:transition-[outline-color] after:duration-150',
    density === 'sparse' && iconOnly !== 'adornment' ? 'after:rounded-sm' : 'after:rounded-full',
    iconOnly === 'adornment' && 'after:outline-offset-0',

    // :disabled styles
    'disabled:pointer-events-none',
    'disabled:after:pointer-events-none',

    /**
     * The focus outline is styled on the `::after` pseudo-element, rather than
     * just adding an `outline` to the base element. This is because, if we only
     * used `outline`, and the currently focused button is right before a
     * disabled button, the overlay of the disabled button would be above the
     * outline, making the outline appear to be partly cut off.
     */
    'focus-within:outline-none',
    getAfterOutlineColorByActionType(actionType),
  );

/** Adds overlays to a button for when it's hovered, active, or disabled. */
export const getOverlays = ({ actionType, density }: ButtonStyleAttributes): string =>
  cn(
    'relative',
    'before:content-[""] before:absolute before:inset-0 before:z-[1] before:outline-2 before:outline before:outline-transparent duration-150 before:transition-[background-color] before:transition-[outline-color]',
    'hover:before:bg-action-hoverOverlay',
    'active:before:bg-action-activeOverlay',
    'disabled:before:cursor-not-allowed disabled:before:bg-action-disabledOverlay',
    getBeforeOutlineColorByActionType(actionType),
    density === 'sparse' ? 'before:rounded-sm' : 'before:rounded-full',
  );

export const getBackground = (
  actionType: ActionType,
  priority: Priority,
  iconOnly?: boolean | 'adornment',
): string => {
  if (priority === 'secondary' || iconOnly === 'adornment') {
    return cn('bg-transparent');
  }

  switch (actionType) {
    case 'accent':
      return cn('bg-primary-main');

    case 'default':
      return cn('bg-other-tonalFill10');

    default:
      return getBackgroundColorByActionType(actionType);
  }
};
