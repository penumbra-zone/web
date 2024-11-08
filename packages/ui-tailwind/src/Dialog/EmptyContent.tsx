import { ReactNode } from 'react';
import {
  Overlay as RadixDialogOverlay,
  Portal as RadixDialogPortal,
  Content as RadixDialogContent,
} from '@radix-ui/react-dialog';

export interface DialogEmptyContentProps {
  children?: ReactNode;
  /** @deprecated this prop will be removed in the future */
  zIndex?: number;
}

export const EmptyContent = ({ children, zIndex }: DialogEmptyContentProps) => {
  return (
    <RadixDialogPortal>
      <RadixDialogOverlay className='fixed inset-0 z-auto bg-other-overlay backdrop-blur-xs' />

      <RadixDialogContent>
        <div className='pointer-events-none fixed inset-0' style={{ zIndex }}>
          {children}
        </div>
      </RadixDialogContent>
    </RadixDialogPortal>
  );
};
