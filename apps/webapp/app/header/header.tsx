'use client';
import Link from 'next/link';
import { FilledImage } from '../../shared';
import { Navbar } from './navbar';
import { DappPath } from './paths';
import dynamic from 'next/dynamic';
import { useStore } from '../../state';
import { accountSelector } from '../../state/account';

const Network = dynamic(() => import('./network'), {
  ssr: false,
});

const Notifications = dynamic(() => import('./notifications'), {
  ssr: false,
});

const ConnectButton = dynamic(() => import('./connect-button'), {
  ssr: false,
});

export const Header = () => {
  const { isConnected } = useStore(accountSelector);
  return (
    <header className='flex h-[82px] w-full items-center justify-between px-12'>
      <Link href={DappPath.INDEX}>
        <FilledImage src='/logo.svg' alt='Penumbra logo' className='h-4 w-[171px]' />
      </Link>
      <Navbar />
      <div className='flex items-center gap-3'>
        {isConnected ? (
          <>
            <Notifications />
            <Network />
          </>
        ) : (
          <ConnectButton />
        )}
      </div>
    </header>
  );
};
