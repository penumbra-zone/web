import { ActionType, getColorByActionType } from './action-type';
import cn from 'clsx';

export interface DropdownMenuItemBase {
  actionType?: ActionType;
  disabled?: boolean;
}

const OUTLINE_COLOR_MAP: Record<ActionType, string> = {
  default: cn('[&:focus:not(:disabled)]:outline-action-neutral-focus-outline'),
  accent: cn('[&:focus:not(:disabled)]:outline-action-primary-focus-outline'),
  unshield: cn('[&:focus:not(:disabled)]:outline-action-unshield-focus-outline'),
  destructive: cn('[&:focus:not(:disabled)]:outline-action-destructive-focus-outline'),
  success: cn('[&:focus:not(:disabled)]:outline-action-success-focus-outline'),
};

export const getMenuItem = (actionType: ActionType): string =>
  cn(
    'w-full flex items-center gap-1 h-8 py-1 px-2 cursor-pointer',
    'border-none rounded-sm bg-transparent transition-colors duration-150',
    '[&:focus:not(:disabled)]:bg-action-hover-overlay [&:focus:not(:disabled)]:outline-solid [&:focus:not(:disabled)]:outline-2',
    getColorByActionType(actionType),
    OUTLINE_COLOR_MAP[actionType],
    'disabled:text-text-muted aria-disabled:text-text-muted',
    'aria-[checked="false"]:pl-9 [&[role="menuitem"][data-icon="false"]]:pl-9',
  );
