import { ReactNode } from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { Trigger } from './trigger.tsx';
import { Content } from './content.tsx';
import { RadioGroup } from './radio-group.tsx';
import { RadioItem } from './radio-item.tsx';
import { CheckboxItem } from './checkbox-item.tsx';
import { Item } from './item.tsx';

interface ControlledDropdownMenuProps {
  /**
   * Whether the popover is currently open. If left `undefined`, this will be
   * treated as an uncontrolled popover — that is, it will open and close based
   * on user interactions rather than on state variables.
   */
  isOpen: boolean;
  /**
   * Callback for when the user closes the popover. Should update the state
   * variable being passed in via `isOpen`. If left `undefined`, users will not
   * be able to close it -- that is, it will only be able to be closed programmatically
   */
  onClose?: VoidFunction;
}

interface UncontrolledDropdownMenuProps {
  isOpen?: undefined;
  onClose?: undefined;
}

export type DropdownMenuProps = {
  children?: ReactNode;
} & (ControlledDropdownMenuProps | UncontrolledDropdownMenuProps);

export const DropdownMenu = ({ children, onClose, isOpen }: DropdownMenuProps) => {
  return (
    <RadixDropdownMenu.Root open={isOpen} onOpenChange={value => onClose && !value && onClose()}>
      {children}
    </RadixDropdownMenu.Root>
  );
};

DropdownMenu.Trigger = Trigger;
DropdownMenu.Content = Content;
DropdownMenu.RadioGroup = RadioGroup;
DropdownMenu.RadioItem = RadioItem;
DropdownMenu.CheckboxItem = CheckboxItem;
DropdownMenu.Item = Item;
