import { Outlet } from 'react-router-dom';
import { HeadTag } from './metadata/head-tag.tsx';
import { Header } from './header/header.tsx';
import { Toaster } from '@penumbra-zone/ui/components/ui/toaster.tsx';

import '@penumbra-zone/ui/styles/globals.css';

export const Layout = () => {
  return (
    <>
      <HeadTag />
      <div className='relative flex min-h-screen flex-col bg-background text-muted'>
        <Header />
        <main className='flex-1 pt-10'>
          <Outlet />
        </main>
      </div>
      <Toaster />
    </>
  );
};
