import { HeaderLogo } from './logo.tsx';
import { Density } from '@repo/ui/Density';
import { PraxPopover } from './prax-popover.tsx';
import { StatusPopover } from './status-popover.tsx';

export const Header = () => {
  return (
    <header className='flex items-center justify-between py-5'>
      <HeaderLogo />

      <div className='flex gap-2'>
        <Density compact>
          <StatusPopover />
          <PraxPopover />
        </Density>
      </div>
    </header>
  )
};

