import { Display } from '@penumbra-zone/ui/Display';
import { HeadTag } from '../metadata/head-tag';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@penumbra-zone/ui/components/ui/toaster';
import { SyncingDialog } from '../syncing-dialog';

export const Layout = () => (
  <Display>
    <HeadTag />
    <Outlet />
    <Toaster />
    <SyncingDialog />
  </Display>
);
