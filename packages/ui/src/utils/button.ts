import cn from 'clsx';
import type { Density } from './density';
import {
  getBeforeOutlineColorByActionType,
  ActionType,
  getBackgroundColorByActionType,
} from './action-type';

export type Priority = 'primary' | 'secondary';

interface ButtonStyleAttributes {
  density: Density;
  iconOnly?: boolean | 'adornment';
  actionType: ActionType;
  priority: Priority;
}

/** Shared styles to use for any `<button />` */
export const buttonBase = cn('appearance-none border-none text-inherit cursor-pointer p-0');

export const getFont = ({ density }: ButtonStyleAttributes): string => {
  if (density === 'compact') {
    return cn('font-default text-textSm font-medium leading-textSm');
  }
  if (density === 'slim') {
    return cn('font-default text-textXs font-medium leading-textXs');
  }
  return cn('font-default text-textBase font-medium leading-textBase');
};

/** Adds overlays to a button for when it's hovered, active, or disabled. */
export const getOverlays = ({ actionType, density }: ButtonStyleAttributes): string =>
  cn(
    'relative',
    'before:content-[""] before:absolute before:inset-0 before:z-[1] before:outline-[1.5] before:outline before:outline-transparent duration-150 before:transition-[background-color,outline-color]',
    'hover:before:bg-action-hoverOverlay',
    'active:before:bg-action-activeOverlay',
    'disabled:before:cursor-not-allowed disabled:before:bg-action-disabledOverlay',
    getBeforeOutlineColorByActionType(actionType),
    density === 'sparse' ? 'before:rounded-sm' : 'before:rounded-full',
  );

export const getBackground = ({
  priority,
  actionType,
  iconOnly,
}: ButtonStyleAttributes): string => {
  if (priority === 'secondary' || iconOnly === 'adornment') {
    return cn('bg-transparent');
  }

  switch (actionType) {
    case 'default':
      return cn('bg-other-tonalFill10');

    default:
      return getBackgroundColorByActionType(actionType);
  }
};

export const getSize = ({ iconOnly, density }: ButtonStyleAttributes) => {
  if (density === 'compact') {
    return cn('rounded-full h-8 min-w-8 w-max', iconOnly ? 'pl-2 pr-2' : 'pl-4 pr-4');
  }

  if (density === 'slim') {
    return cn('rounded-full h-6 min-w-6 w-max', iconOnly ? 'pl-1 pr-1' : 'pl-2 pr-2');
  }

  return cn('rounded-sm h-12', iconOnly ? 'w-12 min-w-12 pl-0 pr-0' : 'w-full pl-4 pr-4');
};

export const getIconSize = (density: Density): number => {
  if (density === 'compact') {
    return 16;
  }
  if (density === 'slim') {
    return 12;
  }
  return 24;
};
