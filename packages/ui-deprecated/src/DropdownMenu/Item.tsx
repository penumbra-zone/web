import { ReactNode } from 'react';
import { Item as RadixDropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { asTransientProps } from '../utils/asTransientProps.ts';
import { Text } from '../Text';
import { DropdownMenuItemBase, MenuItem } from '../utils/menuItem.ts';

export interface DropdownMenuItemProps extends DropdownMenuItemBase {
  children?: ReactNode;
  onSelect?: (event: Event) => void;
  icon?: ReactNode;
}

export const Item = ({
  children,
  icon,
  actionType = 'default',
  disabled,
  onSelect,
}: DropdownMenuItemProps) => {
  return (
    <RadixDropdownMenuItem disabled={disabled} asChild onSelect={onSelect}>
      <MenuItem data-icon={!!icon} {...asTransientProps({ actionType, disabled })}>
        {icon}
        <Text small>{children}</Text>
      </MenuItem>
    </RadixDropdownMenuItem>
  );
};
