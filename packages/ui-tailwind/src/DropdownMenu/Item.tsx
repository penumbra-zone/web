import { ReactNode } from 'react';
import { Item as RadixDropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Text } from '../Text';
import { DropdownMenuItemBase, getMenuItem } from '../utils/menu-item.ts';

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
      <div data-icon={!!icon} className={getMenuItem(actionType)}>
        {icon}
        <Text small>{children}</Text>
      </div>
    </RadixDropdownMenuItem>
  );
};
