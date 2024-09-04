import { Display } from '@penumbra-zone/ui/Display';
import { HeadTag } from '../metadata/head-tag';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@penumbra-zone/ui/components/ui/toaster';
import { SyncingDialog } from '../syncing-dialog';
import { Header } from './header';
import { SyncBar } from './header/sync-bar.tsx';

export const Layout = () => (
  <Display>
    <HeadTag />

    <SyncBar />
    <Header />

    <Outlet />
    <Toaster />
    <SyncingDialog />
  </Display>
);
