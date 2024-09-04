import styled from 'styled-components';
import { ActionType, getColorByActionType, getOutlineColorByActionType } from './ActionType.ts';

export interface DropdownMenuItemBase {
  actionType?: ActionType;
  disabled?: boolean;
}

export interface StyledItemProps {
  $actionType: ActionType;
  $disabled?: boolean;
}

export const MenuItem = styled.div<StyledItemProps>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing(1)};
  height: ${props => props.theme.spacing(8)};
  padding: ${props => props.theme.spacing(1)} ${props => props.theme.spacing(2)};

  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};

  color: ${props => getColorByActionType(props.theme, props.$actionType)};
  cursor: pointer;

  background-color: transparent;
  transition: background-color 0.15s;

  &:focus:not(:disabled) {
    background-color: ${props => props.theme.color.action.hoverOverlay};
    outline: 2px solid ${props => getOutlineColorByActionType(props.theme, props.$actionType)};
  }

  &[aria-disabled='true'],
  &:disabled {
    color: ${props => props.theme.color.text.muted};
  }

  &[aria-checked='false'],
  &[role='menuitem'] {
    padding-left: ${props => props.theme.spacing(9)};
  }

  & > span {
    color: inherit;
  }
`;
