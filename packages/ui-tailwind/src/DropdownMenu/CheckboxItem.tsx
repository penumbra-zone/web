import {
  CheckboxItem as RadixDropdownMenuCheckboxItem,
  ItemIndicator as RadixDropdownMenuItemIndicator,
} from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Text } from '../Text';
import { DropdownMenuItemBase, getMenuItem } from '../utils/menu-item.ts';

export interface DropdownMenuCheckboxItemProps extends DropdownMenuItemBase {
  children?: ReactNode;
  checked?: boolean;
  onChange?: (value: boolean) => void;
}

export const CheckboxItem = ({
  children,
  actionType = 'default',
  disabled,
  checked,
  onChange,
}: DropdownMenuCheckboxItemProps) => {
  return (
    <RadixDropdownMenuCheckboxItem
      asChild
      checked={checked}
      disabled={disabled}
      onCheckedChange={onChange}
    >
      <div className={getMenuItem(actionType)}>
        <RadixDropdownMenuItemIndicator>
          <Check />
        </RadixDropdownMenuItemIndicator>

        <Text small>{children}</Text>
      </div>
    </RadixDropdownMenuCheckboxItem>
  );
};
