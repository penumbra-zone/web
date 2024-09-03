import type { LucideIcon } from 'lucide-react';
import type { FC, MouseEventHandler } from 'react';
import { MenuItem as SharedMenuItem, DropdownMenuItemBase } from '../utils/menuItem';
import { Text } from '../Text';
import styled from 'styled-components';
import { asTransientProps } from '../utils/asTransientProps.ts';

const IconAdornment = styled.i`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing(1)};
  width: ${props => props.theme.spacing(6)};
  height: ${props => props.theme.spacing(6)};
`;

export interface MenuItemProps extends DropdownMenuItemBase {
  label: string;
  icon?: LucideIcon | FC;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/**
 * A button generally used in menus or selectable lists
 */
export const MenuItem = ({
  actionType = 'default',
  icon: IconComponent,
  label,
  onClick,
  disabled,
}: MenuItemProps) => {
  return (
    <SharedMenuItem
      as='button'
      {...asTransientProps({ actionType, disabled })}
      disabled={disabled}
      onClick={onClick}
    >
      {IconComponent && (
        <IconAdornment>
          <IconComponent size={16} />
        </IconAdornment>
      )}
      <Text small>{label}</Text>
    </SharedMenuItem>
  );
};
