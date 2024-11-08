import { Outlet } from 'react-router-dom';
import { HeadTag } from './metadata/head-tag';
import { Header } from './header/header';
import { Toaster } from '@penumbra-zone/ui-old/components/ui/toaster';
import { Footer } from './footer/footer';
import { SyncingDialog } from './syncing-dialog';
import '@penumbra-zone/ui-old/styles/globals.css';

export const Layout = () => {
  return (
    <>
      <HeadTag />

      <div className='flex min-h-screen w-full flex-col'>
        <Header />
        <main className='flex size-full flex-1 px-4'>
          <Outlet />
        </main>
        <Footer />
      </div>

      <Toaster />
      <SyncingDialog />
    </>
  );
};
