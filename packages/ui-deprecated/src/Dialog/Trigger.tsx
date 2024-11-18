import { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';

export interface DialogTriggerProps {
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

export const Trigger = ({ children, asChild }: DialogTriggerProps) => (
  <RadixDialog.Trigger asChild={asChild}>{children}</RadixDialog.Trigger>
);
