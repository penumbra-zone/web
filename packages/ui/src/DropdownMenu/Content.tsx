import { ReactNode } from 'react';
import { useTheme } from 'styled-components';
import {
  Content as RadixDropdownMenuContent,
  Portal as RadixDropdownMenuPortal,
  DropdownMenuContentProps as RadixDropdownMenuContentProps,
} from '@radix-ui/react-dropdown-menu';
import { PopoverContent } from '../utils/popover.ts';

export interface DropdownMenuContentProps {
  children?: ReactNode;
  side?: RadixDropdownMenuContentProps['side'];
  align?: RadixDropdownMenuContentProps['align'];
}

export const Content = ({ children, side, align }: DropdownMenuContentProps) => {
  const theme = useTheme();

  return (
    <RadixDropdownMenuPortal>
      <RadixDropdownMenuContent
        sideOffset={theme.spacing(1, 'number')}
        side={side}
        align={align}
        asChild
      >
        <PopoverContent>{children}</PopoverContent>
      </RadixDropdownMenuContent>
    </RadixDropdownMenuPortal>
  );
};
