import {
  RadioItem as RadixDropdownMenuRadioItem,
  ItemIndicator as RadixDropdownMenuItemIndicator,
} from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Text } from '../Text';
import { DropdownMenuItemBase, getMenuItem } from '../utils/menu-item.ts';

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
      <div className={getMenuItem(actionType)}>
        <RadixDropdownMenuItemIndicator>
          <Check />
        </RadixDropdownMenuItemIndicator>

        <Text small>{children}</Text>
      </div>
    </RadixDropdownMenuRadioItem>
  );
};
