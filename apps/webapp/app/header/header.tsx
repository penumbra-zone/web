import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FilledImage } from '../../shared';
import { DappPath } from '../../shared/header/types';
import { Navbar } from './navbar';
import { TabletNavMenu } from './tablet-nav-menu';

const Network = dynamic(() => import('./network'), {
  ssr: false,
});

const Notifications = dynamic(() => import('./notifications'), {
  ssr: false,
});

export const Header = () => {
  return (
    <header className='flex h-[82px] w-full items-center justify-between px-12'>
      <Link href={DappPath.DASHBOARD}>
        <FilledImage src='/logo.svg' alt='Penumbra logo' className='h-4 w-[171px]' />
      </Link>
      <Navbar />
      <div className='flex items-center md:gap-6 xl:gap-4'>
        <TabletNavMenu />
        <Notifications />
        <Network />
      </div>
    </header>
  );
};
