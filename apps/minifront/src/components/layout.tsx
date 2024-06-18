import { Outlet } from 'react-router-dom';
import { HeadTag } from './metadata/head-tag';
import { Header } from './header/header';
import { Toaster } from '@repo/ui/components/ui/toaster';
import { Footer } from './footer/footer';
import '@repo/ui/styles/globals.css';
import { MotionConfig } from 'framer-motion';

export const Layout = () => {
  return (
    <MotionConfig transition={{ duration: 0.1 }}>
      <HeadTag />
      <div className='flex min-h-screen w-full flex-col'>
        <Header />
        <main className='flex size-full flex-1 px-4'>
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster />
    </MotionConfig>
  );
};
