import { Menu, X } from 'lucide-react';
import { Button } from '@repo/ui/Button';
import { Dialog } from '@repo/ui/Dialog';
import { StatusPopover } from './status-popover.tsx';
import { PraxPopover } from './prax-popover.tsx';
import { HeaderLogo } from './logo.tsx';
import { useState } from 'react';

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Button iconOnly icon={Menu} onClick={() => setIsOpen(true)}>
        Menu
      </Button>
      <Dialog.EmptyContent>
        <div className='pointer-events-auto h-full overflow-hidden bg-black'>
          <nav className='flex items-center justify-between py-5'>
            <HeaderLogo />

            <div className='flex gap-2'>
              <StatusPopover />
              <PraxPopover />
              <Button iconOnly icon={X} onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </nav>
        </div>
      </Dialog.EmptyContent>
    </Dialog>
  );
};
