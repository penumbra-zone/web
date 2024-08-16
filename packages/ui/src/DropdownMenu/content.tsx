import { ReactNode } from 'react';
import { DropdownMenuContentProps as RadixDropdownMenuContentProps } from '@radix-ui/react-dropdown-menu';
import { useTheme } from 'styled-components';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { PopoverContent } from '../Popover/styles.ts';

export interface DropdownMenuContentProps {
  children?: ReactNode;
  side?: RadixDropdownMenuContentProps['side'];
  align?: RadixDropdownMenuContentProps['align'];
}

export const Content = ({ children, side, align }: DropdownMenuContentProps) => {
  const theme = useTheme();

  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        sideOffset={theme.spacing(1, 'number')}
        side={side}
        align={align}
        asChild
      >
        <PopoverContent>{children}</PopoverContent>
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  );
};
