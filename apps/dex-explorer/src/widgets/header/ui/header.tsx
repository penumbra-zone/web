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
      <header className='grid grid-cols-3 items-center p-4'>
        <div className='flex items-center'>
          <HeaderLogo />
        </div>

        <div className='flex justify-center'>
          <DesktopNav />
        </div>

        <div className='flex items-center justify-end gap-2'>
          <div className='hidden lg:flex items-center gap-2'>
            <Density sparse>
              <StatusPopover />
              <Connection />
            </Density>
          </div>

          <div className='flex lg:hidden items-center gap-2'>
            <Density compact>
              <StatusPopover />
              <Connection mobile />
              <MobileNav />
            </Density>
          </div>
        </div>
      </header>
    </>
  );
};
