import { Density } from '@penumbra-zone/ui/Density';
import { HeaderLogo } from './logo';
import { StatusPopover } from './status-popover';
import { MobileNav } from './mobile-nav';
import { DesktopNav } from './desktop-nav';
import { Connection } from './connection';
import { AlphaDevelopmentBanner } from './banner';

export const Header = () => {
  return (
    <>
      <AlphaDevelopmentBanner />
      <header className='flex items-center justify-between p-4'>
        <HeaderLogo />
        <DesktopNav />

        <Density compact>
          <div className='hidden gap-2 lg:flex'>
            <StatusPopover />
            <Connection />
          </div>
          <div className='block lg:hidden'>
            <MobileNav />
          </div>
        </Density>
      </header>
    </>
  );
};
