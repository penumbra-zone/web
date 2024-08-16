import { ReactNode } from 'react';
import { RadioGroup as RadixDropdownMenuRadioGroup } from '@radix-ui/react-dropdown-menu';

export interface DropdownMenuRadioGroupProps {
  children?: ReactNode;
  value?: string;
  onChange?: (value: string) => void;
}

export const RadioGroup = ({ children, value, onChange }: DropdownMenuRadioGroupProps) => {
  return (
    <RadixDropdownMenuRadioGroup value={value} onValueChange={onChange}>
      {children}
    </RadixDropdownMenuRadioGroup>
  );
};
