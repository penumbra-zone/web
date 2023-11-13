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
    <header className='z-10 flex h-[82px] w-full flex-col items-center justify-between px-6 md:flex-row md:px-12'>
      <div className='mb-[46px] md:mb-0'>
        <img
          src='/penumbra-logo.svg'
          width={234}
          height={234}
          alt='Penumbra logo'
          className='absolute inset-x-0 top-[-85px] mx-auto h-[126px] w-[126px] rotate-[320deg] md:left-[-100px] md:top-[-140px] md:mx-0 md:h-[234px] md:w-[234px]'
        />
        <Link to={PagePath.INDEX}>
          <img
            src='/logo.svg'
            alt='Penumbra logo'
            className='relative z-10 mt-3 h-[10px] w-[84px] md:mt-0 md:h-4 md:w-[171px]'
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
