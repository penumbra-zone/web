import { Outlet } from 'react-router-dom';
import { HeadTag } from '../metadata/head-tag';
import { Toaster } from '@repo/ui/components/ui/toaster';
import { SyncingDialog } from '../syncing-dialog';

export const Layout = () => (
  <div>
    <HeadTag />
    <Outlet />
    <Toaster />
    <SyncingDialog />
  </div>
);
