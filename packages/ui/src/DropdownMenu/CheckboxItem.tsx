import {
  CheckboxItem as RadixDropdownMenuCheckboxItem,
  ItemIndicator as RadixDropdownMenuItemIndicator,
} from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { asTransientProps } from '../utils/asTransientProps.ts';
import { Text } from '../Text';
import { DropdownMenuItemBase, MenuItem } from './shared.ts';

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
      checked={checked}
      disabled={disabled}
      asChild
      onCheckedChange={onChange}
    >
      <MenuItem {...asTransientProps({ actionType, disabled })}>
        <RadixDropdownMenuItemIndicator>
          <Check />
        </RadixDropdownMenuItemIndicator>

        <Text small>{children}</Text>
      </MenuItem>
    </RadixDropdownMenuCheckboxItem>
  );
};
