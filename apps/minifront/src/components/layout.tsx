import { Outlet } from 'react-router-dom';
import { HeadTag } from './metadata/head-tag';
import { Header } from './header/header';
import { Toaster } from '@repo/ui/components/ui/toaster';
import { Footer } from './footer/footer';
import '@repo/ui/styles/globals.css';

/**
 * @todo: add back the SyncingDialog once we've determined whether it can be
 * dismissed.
 */
// import { SyncingDialog } from './syncing-dialog';

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
      {/* <SyncingDialog /> */}
    </>
  );
};
