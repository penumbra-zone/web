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
export const buttonBase = cn('cursor-pointer appearance-none border-none text-inherit');

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
  let borderRadius: string;
  if (rounded) {
    borderRadius = 'before:rounded-full';
  } else if (density === 'sparse') {
    borderRadius = 'before:rounded-sm';
  } else {
    borderRadius = 'before:rounded-full';
  }

  return cn(
    'relative',
    'duration-150 before:absolute before:inset-0 before:z-1 before:outline-[1.5] before:outline-transparent before:transition-[background-color,outline-color] before:content-[""] before:outline-solid',
    'hover:before:bg-action-hover-overlay',
    'active:before:bg-action-active-overlay',
    'disabled:before:cursor-not-allowed disabled:before:bg-action-disabled-overlay',
    getBeforeOutlineColorByActionType(actionType),
    // Apply overlay border radius to match button border radius
    borderRadius,
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
      return cn('bg-other-tonal-fill10');

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
      'h-8 w-max min-w-8',
      iconOnly ? 'pr-0 pl-0' : 'pr-4 pl-4',
      rounded ? 'rounded-full' : 'rounded-full', // compact is always rounded
    );
  }

  if (density === 'slim') {
    return cn(
      'h-6 w-max min-w-6',
      iconOnly ? 'pr-0 pl-0' : 'pr-2 pl-2',
      rounded ? 'rounded-full' : 'rounded-full', // slim is always rounded
    );
  }

  return cn(
    'h-12',
    iconOnly ? 'w-12 min-w-12 pr-0 pl-0' : 'w-full pr-4 pl-4',
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
