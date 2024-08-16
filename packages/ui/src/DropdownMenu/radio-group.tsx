import { ReactNode } from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

export interface DropdownMenuRadioGroupProps {
  children?: ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const RadioGroup = ({ children, value, onValueChange }: DropdownMenuRadioGroupProps) => {
  return (
    <RadixDropdownMenu.RadioGroup value={value} onValueChange={onValueChange}>
      {children}
    </RadixDropdownMenu.RadioGroup>
  );
};
