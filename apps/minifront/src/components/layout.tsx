import { Outlet } from 'react-router-dom';
import { HeadTag } from './metadata/head-tag';
import { Header } from './header/header';
import { Toaster } from '@penumbra-zone/ui/components/ui/toaster';
import { Footer } from './footer/footer';
import '@penumbra-zone/ui/styles/globals.css';
import { getChainId } from '../fetchers/chain-id';
import { useEffect, useState } from 'react';
import { TestnetBanner } from '@penumbra-zone/ui/components/ui/testnet-banner';
import { MotionConfig } from 'framer-motion';

export const Layout = () => {
  const [chainId, setChainId] = useState<string | undefined>();

  useEffect(() => {
    void getChainId().then(id => setChainId(id));
  }, []);

  return (
    <MotionConfig transition={{ duration: 0.1 }}>
      <TestnetBanner chainId={chainId} />
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
