import { Navbar } from './navbar';
import { Link, useLoaderData } from 'react-router-dom';
import { PagePath } from '../metadata/paths.ts';
import Notifications from './notifications.tsx';
import { TabletNavMenu } from './tablet-nav-menu.tsx';
import { LayoutLoaderResult } from '../layout.tsx';
import { NetworksPopover } from '@penumbra-zone/ui';

export const Header = () => {
  const result = useLoaderData() as LayoutLoaderResult;

  return (
    <header className='flex h-[82px] w-full items-center justify-between px-12'>
      <img
        src='/penumbra-logo.svg'
        width={234}
        height={234}
        alt='Penumbra logo'
        className='absolute left-[-100px] top-[-140px] rotate-[320deg]'
      />
      <Link to={PagePath.INDEX}>
        <img src='/logo.svg' alt='Penumbra logo' className='relative z-10 h-4 w-[171px]' />
      </Link>
      <Navbar />
      <div className='flex items-center md:gap-6 xl:gap-4'>
        <TabletNavMenu />
        {result.isInstalled ? (
          <>
            <Notifications />
            <NetworksPopover name={result.chainId} />
          </>
        ) : null}
      </div>
    </header>
  );
};
