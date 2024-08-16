import { ReactNode } from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

export interface DropdownMenuTriggerProps {
  children: ReactNode;
  /**
   * Change the default rendered element for the one passed as a child, merging
   * their props and behavior.
   *
   * Uses Radix UI's `asChild` prop under the hood.
   *
   * @see https://www.radix-ui.com/primitives/docs/guides/composition
   */
  asChild?: boolean;
}

export const Trigger = ({ children, asChild }: DropdownMenuTriggerProps) => (
  <RadixDropdownMenu.Trigger asChild={asChild}>{children}</RadixDropdownMenu.Trigger>
);
