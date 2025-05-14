import { Display } from '@penumbra-zone/ui-deprecated/Display';
import { HeadTag } from '../metadata/head-tag';
import { Outlet } from 'react-router-dom';
import { SyncingDialog } from '../syncing-dialog';
import { Header } from './header';
import { SyncBar } from './header/sync-bar.tsx';
import '@penumbra-zone/ui/style.css';

export const Layout = () => (
  <Display>
    <HeadTag />

    <SyncBar />
    
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[1136px] px-0 md:px-4">
        <Header />
        <Outlet />
      </div>
    </div>
    
    <SyncingDialog />
  </Display>
);
