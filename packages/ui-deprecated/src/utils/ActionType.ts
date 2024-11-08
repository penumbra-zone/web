import type { DefaultTheme } from 'styled-components';

export type ActionType = 'default' | 'accent' | 'unshield' | 'destructive';

export const getColorByActionType = (theme: DefaultTheme, actionType: ActionType): string => {
  if (actionType === 'destructive') {
    return theme.color.destructive.light;
  }
  return theme.color.text.primary;
};

export const getOutlineColorByActionType = (
  theme: DefaultTheme,
  actionType: ActionType,
): string => {
  const map: Record<ActionType, keyof DefaultTheme['color']['action']> = {
    default: 'neutralFocusOutline',
    accent: 'primaryFocusOutline',
    unshield: 'unshieldFocusOutline',
    destructive: 'destructiveFocusOutline',
  };
  return theme.color.action[map[actionType]];
};
