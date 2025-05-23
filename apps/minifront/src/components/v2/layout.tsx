import { Display } from '@penumbra-zone/ui-deprecated/Display';
import { HeadTag } from '../metadata/head-tag';
import { Outlet } from 'react-router-dom';
import { SyncingDialog } from '../syncing-dialog';
import { Header } from './header';
import { SyncBar } from './header/sync-bar.tsx';
import '@penumbra-zone/ui/style.css';
import { useEffect } from 'react';

export const Layout = () => {
  useEffect(() => {
    const body = document.body;
    // V2 routes should NOT have v1-bg
    body.style.backgroundColor = 'hsl(var(--background))';

    // Add v1-bg back when navigating away from V2
    return () => {
      body.style.backgroundColor = 'black';
    };
  }, []); // Empty dependency array means this runs on mount and unmount

  return (
    <Display>
      <HeadTag />

      <SyncBar />

      <div className='flex w-full flex-col items-center'>
        <div className='w-full max-w-[1136px] px-0 md:px-4'>
          <Header />
          <Outlet />
        </div>
      </div>

      <SyncingDialog />
    </Display>
  );
};
