import cn from 'clsx';

export type ActionType = 'default' | 'accent' | 'unshield' | 'destructive';

export const getColorByActionType = (actionType: ActionType): string => {
  if (actionType === 'destructive') {
    return cn('text-destructive-light');
  }
  return cn('text-text-primary');
};

const AFTER_OUTLINE_COLOR_MAP: Record<ActionType, string> = {
  default: cn('focus-within:after:outline-action-neutralFocusOutline'),
  accent: cn('focus-within:after:outline-action-primaryFocusOutline'),
  unshield: cn('focus-within:after:outline-action-unshieldFocusOutline'),
  destructive: cn('focus-within:after:outline-action-destructiveFocusOutline'),
};

const OUTLINE_COLOR_MAP: Record<ActionType, string> = {
  default: cn('outline-neutral-main'),
  accent: cn('outline-primary-main'),
  unshield: cn('outline-unshield-main'),
  destructive: cn('outline-destructive-main'),
};

const BEFORE_OUTLINE_COLOR_MAP: Record<ActionType, string> = {
  default: cn('focus:before:outline-action-neutralFocusOutline'),
  accent: cn('focus:before:outline-action-primaryFocusOutline'),
  unshield: cn('focus:before:outline-action-unshieldFocusOutline'),
  destructive: cn('focus:before:outline-action-destructiveFocusOutline'),
};

const FOCUS_OUTLINE_COLOR_MAP: Record<ActionType, string> = {
  default: cn('focus:outline-action-neutralFocusOutline'),
  accent: cn('focus:outline-action-primaryFocusOutline'),
  unshield: cn('focus:outline-action-unshieldFocusOutline'),
  destructive: cn('focus:outline-action-destructiveFocusOutline'),
};

const FOCUS_WITHIN_OUTLINE_COLOR_MAP: Record<ActionType, string> = {
  default: cn('focus-within:outline-action-neutralFocusOutline'),
  accent: cn('focus-within:outline-action-primaryFocusOutline'),
  unshield: cn('focus-within:outline-action-unshieldFocusOutline'),
  destructive: cn('focus-within:outline-action-destructiveFocusOutline'),
};

const ARIA_CHECKED_OUTLINE_COLOR_MAP: Record<ActionType, string> = {
  default: cn('aria-checked:outline-action-neutralFocusOutline'),
  accent: cn('aria-checked:outline-action-primaryFocusOutline'),
  unshield: cn('aria-checked:outline-action-unshieldFocusOutline'),
  destructive: cn('aria-checked:outline-action-destructiveFocusOutline'),
};

const BORDER_COLOR_MAP: Record<ActionType, string> = {
  default: cn('border-neutral-main'),
  accent: cn('border-primary-main'),
  unshield: cn('border-unshield-main'),
  destructive: cn('border-destructive-main'),
};

const BACKGROUND_COLOR_MAP: Record<ActionType, string> = {
  default: cn('bg-neutral-main'),
  accent: cn('bg-primary-main'),
  unshield: cn('bg-unshield-main'),
  destructive: cn('bg-destructive-main'),
};

export const getAfterOutlineColorByActionType = (actionType: ActionType): string => {
  return AFTER_OUTLINE_COLOR_MAP[actionType];
};

export const getBeforeOutlineColorByActionType = (actionType: ActionType): string => {
  return BEFORE_OUTLINE_COLOR_MAP[actionType];
};

export const getOutlineColorByActionType = (actionType: ActionType): string => {
  return OUTLINE_COLOR_MAP[actionType];
};

export const getFocusOutlineColorByActionType = (actionType: ActionType): string => {
  return FOCUS_OUTLINE_COLOR_MAP[actionType];
};

export const getFocusWithinOutlineColorByActionType = (actionType: ActionType): string => {
  return FOCUS_WITHIN_OUTLINE_COLOR_MAP[actionType];
};

export const getAriaCheckedOutlineColorByActionType = (actionType: ActionType): string => {
  return ARIA_CHECKED_OUTLINE_COLOR_MAP[actionType];
};

export const getBorderColorByActionType = (actionType: ActionType): string => {
  return BORDER_COLOR_MAP[actionType];
};

export const getBackgroundColorByActionType = (actionType: ActionType): string => {
  return BACKGROUND_COLOR_MAP[actionType];
};
