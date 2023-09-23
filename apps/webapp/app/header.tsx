import Image from 'next/image';
import { NetworksPopover } from 'ui';

export const Header = () => {
  return (
    <header className='w-full px-8 h-[82px] flex items-center justify-between '>
      <Image src='/logo.svg' width={161} height={16} alt='Penumbra logo' />
      <div className='flex'>
        <NetworksPopover triggerClassName='px-[9px]' />
      </div>
    </header>
  );
};
