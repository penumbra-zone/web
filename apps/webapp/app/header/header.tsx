import Image from 'next/image';
import { NetworksPopover } from 'ui';
import { Notifications } from './notifications';
import { Navbar } from './navbar';

export const Header = () => {
  return (
    <header className='flex h-[82px] w-full items-center justify-between px-12'>
      <Image src='/logo.svg' width={171} height={16} alt='Penumbra logo' />
      <Navbar />
      <div className='flex items-center gap-3'>
        <Notifications />
        <NetworksPopover triggerClassName='px-[9px]' />
        <div className='ml-1 flex items-center gap-3 rounded-lg border px-5 py-[7px]'>
          <Image
            src='https://avatar.vercel.sh/rauchg'
            alt='icon'
            width={20}
            height={20}
            className='rounded-full'
          />
          <p className='font-bold text-muted-foreground'>2t1m...2x95f</p>
        </div>
      </div>
    </header>
  );
};
