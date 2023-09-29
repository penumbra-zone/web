import Image from 'next/image';
import { NetworksPopover } from 'ui';
import { Notifications } from './notifications';
import { Navbar } from './navbar';
import Link from 'next/link';
import { DappPath } from './paths';

export const Header = () => {
  return (
    <header className='flex h-[82px] w-full items-center justify-between px-12'>
      <Link href={DappPath.INDEX}>
        <div className='h-4 w-[171px]'>
          <Image src='/logo.svg' width={171} height={16} alt='Penumbra logo' />
        </div>
      </Link>
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
