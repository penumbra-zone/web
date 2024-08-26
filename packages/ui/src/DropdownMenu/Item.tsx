import type { ReactNode } from 'react';
import { Item as RadixDropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { asTransientProps } from '../utils/asTransientProps.ts';
import { Text } from '../Text';
import { DropdownMenuItemBase, MenuItem } from './shared.ts';

export interface DropdownMenuItemProps extends DropdownMenuItemBase {
  children?: ReactNode;
  onSelect?: (event: Event) => void;
}

export const Item = ({
  children,
  actionType = 'default',
  disabled,
  onSelect,
}: DropdownMenuItemProps) => {
  return (
    <RadixDropdownMenuItem disabled={disabled} asChild onSelect={onSelect}>
      <MenuItem {...asTransientProps({ actionType, disabled })}>
        <Text small>{children}</Text>
      </MenuItem>
    </RadixDropdownMenuItem>
  );
};
