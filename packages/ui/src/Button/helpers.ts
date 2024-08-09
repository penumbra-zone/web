import { DefaultTheme } from 'styled-components';
import { Priority } from '../utils/button';
import { ActionType } from '../utils/ActionType';

export const getBackgroundColor = (
  actionType: ActionType,
  priority: Priority,
  theme: DefaultTheme,
  iconOnly?: boolean | 'adornment',
): string => {
  if (priority === 'secondary' || iconOnly === 'adornment') {
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
