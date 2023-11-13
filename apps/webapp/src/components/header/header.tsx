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
    <header className='flex flex-col md:flex-row h-[82px] w-full items-center justify-between px-5 md:px-12'>
      <div className='mb-[46px] md:mb-0'>
        <img
          src='/penumbra-logo.svg'
          width={234}
          height={234}
          alt='Penumbra logo'
          className='absolute left-0 right-0 mr-auto ml-auto top-[-85px] md:left-[-100px] md:top-[-140px] rotate-[320deg] md:mr-0 md:ml-0 h-[126px] w-[126px] md:h-[234px] md:w-[234px]'
        />
        <Link to={PagePath.INDEX}>
          <img
            src='/logo.svg'
            alt='Penumbra logo'
            className='relative z-10 h-[10px] w-[84px] md:h-4 md:w-[171px] mt-3 md:mt-0'
          />
        </Link>
      </div>
      <Navbar />
      <div className='flex w-full justify-between md:w-auto items-center md:gap-6 xl:gap-4'>
        <div className='order-1 block md:hidden'>
          <MobileNavMenu />
        </div>
        <TabletNavMenu />

        {result.isInstalled ? (
          <>
            <div className='flex items-center justify-center order-3 md:order-none'>
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
