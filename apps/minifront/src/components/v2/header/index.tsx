import { HeaderLogo } from './logo.tsx';
import { Density } from '@repo/ui/Density';
import { PraxPopover } from './prax-popover.tsx';
import { StatusPopover } from './status-popover.tsx';
import { MobileNav } from './mobile-nav.tsx';

export const Header = () => {
  return (
    <header className='flex items-center justify-between py-5'>
      <HeaderLogo />

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
