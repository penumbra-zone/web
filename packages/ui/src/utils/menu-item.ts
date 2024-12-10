import { ActionType, getColorByActionType } from './action-type';
import cn from 'clsx';

export interface DropdownMenuItemBase {
  actionType?: ActionType;
  disabled?: boolean;
}

const OUTLINE_COLOR_MAP: Record<ActionType, string> = {
  default: cn('[&:focus:not(:disabled)]:outline-action-neutralFocusOutline'),
  accent: cn('[&:focus:not(:disabled)]:outline-action-primaryFocusOutline'),
  unshield: cn('[&:focus:not(:disabled)]:outline-action-unshieldFocusOutline'),
  destructive: cn('[&:focus:not(:disabled)]:outline-action-destructiveFocusOutline'),
  success: cn('[&:focus:not(:disabled)]:outline-action-successFocusOutline'),
};

export const getMenuItem = (actionType: ActionType): string =>
  cn(
    'w-full flex items-center gap-1 h-8 py-1 px-2 cursor-pointer',
    'border-none rounded-sm bg-transparent transition-colors duration-150',
    '[&:focus:not(:disabled)]:bg-action-hoverOverlay [&:focus:not(:disabled)]:outline [&:focus:not(:disabled)]:outline-2',
    getColorByActionType(actionType),
    OUTLINE_COLOR_MAP[actionType],
    'disabled:text-text-muted aria-disabled:text-text-muted',
    'aria-[checked="false"]:pl-9 [&[role="menuitem"][data-icon="false"]]:pl-9',
  );
