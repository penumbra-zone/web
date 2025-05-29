import cn from 'clsx';
import type { Density } from './density';
import { button, buttonMedium, buttonSmall } from './typography';
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
  rounded?: boolean;
}

/** Shared styles to use for any `<button />` */
export const buttonBase = cn('appearance-none border-none text-inherit cursor-pointer p-0');

export const getFont = ({ density }: ButtonStyleAttributes): string => {
  if (density === 'compact') {
    return buttonMedium;
  }
  if (density === 'slim') {
    return buttonSmall;
  }
  return button;
};

/** Adds overlays to a button for when it's hovered, active, or disabled. */
export const getOverlays = ({ actionType, density, rounded }: ButtonStyleAttributes): string => {
  return cn(
    'relative',
    'before:content-[""] before:absolute before:inset-0 before:z-[1] before:outline-[1.5] before:outline before:outline-transparent duration-150 before:transition-[background-color,outline-color]',
    'hover:before:bg-action-hoverOverlay',
    'active:before:bg-action-activeOverlay',
    'disabled:before:cursor-not-allowed disabled:before:bg-action-disabledOverlay',
    getBeforeOutlineColorByActionType(actionType),
    // Apply overlay border radius to match button border radius
    rounded
      ? 'before:rounded-full'
      : density === 'sparse'
        ? 'before:rounded-sm'
        : 'before:rounded-full',
  );
};

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

export const getSize = ({ iconOnly, density, rounded }: ButtonStyleAttributes) => {
  if (iconOnly === 'adornment' && density === 'compact') {
    return cn(
      'size-6 min-w-6 p-1',
      rounded ? 'rounded-full' : 'rounded-full', // adornment is always rounded
    );
  }

  if (iconOnly === 'adornment' && density === 'slim') {
    return cn(
      'size-4 min-w-4 p-[2px]',
      rounded ? 'rounded-full' : 'rounded-full', // adornment is always rounded
    );
  }

  if (density === 'compact') {
    return cn(
      'h-8 min-w-8 w-max',
      iconOnly ? 'pl-0 pr-0' : 'pl-4 pr-4',
      rounded ? 'rounded-full' : 'rounded-full', // compact is always rounded
    );
  }

  if (density === 'slim') {
    return cn(
      'h-6 min-w-6 w-max',
      iconOnly ? 'pl-0 pr-0' : 'pl-2 pr-2',
      rounded ? 'rounded-full' : 'rounded-full', // slim is always rounded
    );
  }

  return cn(
    'h-12',
    iconOnly ? 'w-12 min-w-12 pl-0 pr-0' : 'w-full pl-4 pr-4',
    rounded ? 'rounded-full' : 'rounded-sm', // sparse uses rounded-sm by default, rounded-full when requested
  );
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
