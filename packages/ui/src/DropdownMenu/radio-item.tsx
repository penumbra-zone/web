import {
  RadioItem as RadixDropdownMenuRadioItem,
  ItemIndicator as RadixDropdownMenuItemIndicator,
} from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { asTransientProps } from '../utils/asTransientProps.ts';
import { Text } from '../Text';
import { DropdownMenuItemBase, MenuItem } from './shared.ts';

export interface DropdownMenuRadioItemProps extends DropdownMenuItemBase {
  children?: ReactNode;
  value: string;
}

export const RadioItem = ({
  children,
  value,
  actionType = 'default',
  disabled,
}: DropdownMenuRadioItemProps) => {
  return (
    <RadixDropdownMenuRadioItem value={value} disabled={disabled} asChild>
      <MenuItem {...asTransientProps({ actionType, disabled })}>
        <RadixDropdownMenuItemIndicator>
          <Check />
        </RadixDropdownMenuItemIndicator>

        <Text small>{children}</Text>
      </MenuItem>
    </RadixDropdownMenuRadioItem>
  );
};
