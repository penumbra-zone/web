import { DefaultTheme } from 'styled-components';
import { Variant, ActionType } from './types';

export const getBackgroundColor = (
  actionType: ActionType,
  variant: Variant,
  theme: DefaultTheme,
): string => {
  if (variant === 'secondary') {
    return 'transparent';
  }

  switch (actionType) {
    case 'accent':
      return theme.color.primary.main;

    case 'default':
      return theme.color.neutral.main;

    default:
      return theme.color[actionType].main;
  }
};
