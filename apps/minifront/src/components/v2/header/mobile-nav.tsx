import { Menu, X } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Display } from '@penumbra-zone/ui/Display';
import { MenuItem } from '@penumbra-zone/ui/MenuItem';
import { StatusPopover } from './status-popover.tsx';
import { ProviderPopover } from './provider-popover.tsx';
import { HeaderLogo } from './logo.tsx';
import { useState } from 'react';
import { HEADER_LINKS } from './links.ts';
import { useNavigate } from 'react-router-dom';

export const MobileNav = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const onNavigate = (link: string) => {
    navigate(link);
    setIsOpen(false);
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Button iconOnly icon={Menu} onClick={() => setIsOpen(true)}>
        Menu
      </Button>
      <Dialog.EmptyContent>
        <div className='pointer-events-auto h-full overflow-hidden bg-black'>
          <Display>
            <nav className='flex items-center justify-between py-5'>
              <HeaderLogo />

              <div className='flex gap-2'>
                <StatusPopover />
                <ProviderPopover />
                <Button iconOnly icon={X} onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </nav>

            <div className='flex flex-col gap-4'>
              {HEADER_LINKS.map(link => (
                <MenuItem
                  key={link.value}
                  label={link.label}
                  icon={link.icon}
                  onClick={() => onNavigate(link.value)}
                />
              ))}
            </div>
          </Display>
        </div>
      </Dialog.EmptyContent>
    </Dialog>
  );
};
