import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { asTransientProps } from '../utils/asTransientProps.ts';
import { Text } from '../Text';
import { DropdownMenuItemBase, MenuItem } from './shared.ts';

export interface DropdownMenuItemProps extends DropdownMenuItemBase {
  children?: ReactNode;
  onSelect?: (event: Event) => void;
}

export const Item = ({ children, actionType = 'default', disabled, onSelect }: DropdownMenuItemProps) => {
  return (
    <RadixDropdownMenu.Item disabled={disabled} asChild onSelect={onSelect}>
      <MenuItem {...asTransientProps({ actionType, disabled })}>
        <Text small>{children}</Text>
      </MenuItem>
    </RadixDropdownMenu.Item>
  );
};
