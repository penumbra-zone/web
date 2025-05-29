import { Density } from '@penumbra-zone/ui/Density';
import { HeaderLogo } from './logo.tsx';
import { ProviderPopover } from './provider-popover.tsx';
import { StatusPopover } from './status-popover.tsx';
import { MobileNav } from './mobile-nav.tsx';
import { DesktopNav } from './desktop-nav.tsx';

export const Header = () => {
  return (
    <MobileNav>
      {({ isOpen }) => (
        <header 
          className={`flex items-start justify-between py-5 transition-all duration-300 ease-in-out ${
            isOpen ? 'min-h-screen bg-background backdrop-blur-xl' : ''
          }`}
        >
          <HeaderLogo />

          <DesktopNav />

          <Density compact>
            <div className='hidden gap-2 lg:flex'>
              <StatusPopover />
              <ProviderPopover />
            </div>
            <div className='flex gap-2 lg:hidden'>
              <StatusPopover />
              <ProviderPopover />
              <MobileNav.ToggleButton />
            </div>
          </Density>

          {/* Mobile navigation content */}
          {isOpen && (
            <div className='absolute top-24 left-0 right-0 lg:hidden'>
              <MobileNav.Content />
            </div>
          )}
        </header>
      )}
    </MobileNav>
  );
};
