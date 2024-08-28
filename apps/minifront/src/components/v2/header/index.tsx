import { Density } from '@penumbra-zone/ui/Density';
import { HeaderLogo } from './logo.tsx';
import { PraxPopover } from './prax-popover.tsx';
import { StatusPopover } from './status-popover.tsx';
import { MobileNav } from './mobile-nav.tsx';
import { DesktopNav } from './desktop-nav.tsx';

export const Header = () => {
  return (
    <header className='flex items-center justify-between py-5'>
      <HeaderLogo />

      <DesktopNav />

      <Density compact>
        <div className='hidden gap-2 lg:flex'>
          <StatusPopover />
          <PraxPopover />
        </div>
        <div className='block lg:hidden'>
          <MobileNav />
        </div>
      </Density>
    </header>
  );
};
