import { ReactNode } from 'react';
import {
  Content as RadixDropdownMenuContent,
  Portal as RadixDropdownMenuPortal,
  DropdownMenuContentProps as RadixDropdownMenuContentProps,
} from '@radix-ui/react-dropdown-menu';
import { getPopoverContent, PopoverContext } from '../utils/popover.ts';

export interface DropdownMenuContentProps {
  children?: ReactNode;
  side?: RadixDropdownMenuContentProps['side'];
  align?: RadixDropdownMenuContentProps['align'];
  context?: PopoverContext;
}

export const Content = ({
  children,
  side,
  align,
  context = 'default',
}: DropdownMenuContentProps) => {
  return (
    <RadixDropdownMenuPortal>
      <RadixDropdownMenuContent sideOffset={4} side={side} align={align} asChild>
        <div className={getPopoverContent(context)}>{children}</div>
      </RadixDropdownMenuContent>
    </RadixDropdownMenuPortal>
  );
};
