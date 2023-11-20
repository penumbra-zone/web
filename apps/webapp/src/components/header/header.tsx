import { Navbar } from './navbar';
import { Link, useLoaderData } from 'react-router-dom';
import { PagePath } from '../metadata/paths.ts';
import Notifications from './notifications.tsx';
import { TabletNavMenu } from './tablet-nav-menu.tsx';
import { LayoutLoaderResult } from '../layout.tsx';
import { NetworksPopover } from '@penumbra-zone/ui';
import { MobileNavMenu } from './mobile-nav-menu.tsx';

export const Header = () => {
  const result = useLoaderData() as LayoutLoaderResult;

  return (
    <header className='z-10 flex w-full flex-col items-center justify-between px-6 md:h-[82px] md:flex-row md:px-12'>
      <div className='mb-[30px] md:mb-0'>
        <img
          src='/penumbra-logo.svg'
          alt='Penumbra logo'
          className='absolute inset-x-0 top-[-75px] mx-auto h-[141px] w-[136px] rotate-[320deg] md:left-[-100px] md:top-[-140px] md:mx-0 md:h-[234px] md:w-[234px]'
        />
        <Link to={PagePath.INDEX}>
          <img
            src='/logo.svg'
            alt='Penumbra logo'
            className='relative z-10 mt-[20px] h-4 w-[171px] md:mt-0'
          />
        </Link>
      </div>
      <Navbar />
      <div className='flex w-full items-center justify-between md:w-auto md:gap-6 xl:gap-4'>
        <div className='order-1 block md:hidden'>
          <MobileNavMenu />
        </div>
        <TabletNavMenu />

        {result.isInstalled ? (
          <>
            <div className='order-3 flex items-center justify-center md:order-none'>
              <Notifications />
            </div>
            <div className='order-2 md:order-none'>
              <NetworksPopover name={result.chainId} />
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
};
