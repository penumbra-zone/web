import type { ReactNode } from 'react';
import { Trigger as RadixDropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

export interface DropdownMenuTriggerProps {
  children: ReactNode;
}

export const Trigger = ({ children }: DropdownMenuTriggerProps) => (
  <RadixDropdownMenuTrigger asChild>{children}</RadixDropdownMenuTrigger>
);
