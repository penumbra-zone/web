import Link from 'next/link';
import { Identicon } from 'ui';
import { FilledImage } from '../../shared';
import { Navbar } from './navbar';
import { DappPath } from './paths';
import dynamic from 'next/dynamic';

const Network = dynamic(() => import('./network'), {
  ssr: false,
});

const Notifications = dynamic(() => import('./notifications'), {
  ssr: false,
});

export const Header = () => {
  return (
    <header className='flex h-[82px] w-full items-center justify-between px-12'>
      <Link href={DappPath.INDEX}>
        <FilledImage src='/logo.svg' alt='Penumbra logo' className='h-4 w-[171px]' />
      </Link>
      <Navbar />
      <div className='flex items-center gap-3'>
        <Notifications />
        <Network />
        <div className='ml-1 flex items-center gap-3 rounded-lg border px-5 py-[7px]'>
          {/* TODO: replace hardcoded value  */}
          <Identicon
            name='penumbrav2t1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvsneeae42q63sumem7r096p7rd2tywm2v6ppc4'
            className='h-5 w-5 rounded-full'
          />
          <p className='font-bold text-muted-foreground'>2t1m...2x95f</p>
        </div>
      </div>
    </header>
  );
};
