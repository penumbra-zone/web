import { LoaderFunction, Outlet, useLoaderData } from 'react-router-dom';
import { getChainId } from '../fetchers/chain-id';
import { HeadTag } from './metadata/head-tag';
import { Header } from './header/header';
import { Toaster } from '@penumbra-zone/ui/components/ui/toaster';
import { ExtensionNotConnected } from './extension-not-connected';
import { ExtensionNotInstalled } from './extension-not-installed';
import { Footer } from './footer/footer';
import { isPraxConnected, isPraxConnectedTimeout, isPraxAvailable } from '@penumbra-zone/client';
import '@penumbra-zone/ui/styles/globals.css';

export type LayoutLoaderResult =
  | { isInstalled: boolean; isConnected: boolean }
  | {
      isInstalled: true;
      isConnected: true;
      chainId: string;
    };

export const LayoutLoader: LoaderFunction = async (): Promise<LayoutLoaderResult> => {
  const isInstalled = isPraxAvailable();
  if (!isInstalled) return { isInstalled, isConnected: false };
  const isConnected = isPraxConnected() || (await isPraxConnectedTimeout(1000));
  if (!isConnected) return { isInstalled, isConnected };
  const chainId = await getChainId();
  return { isInstalled, isConnected, chainId };
};

export const Layout = () => {
  const { isInstalled, isConnected } = useLoaderData() as LayoutLoaderResult;

  if (!isInstalled) return <ExtensionNotInstalled />;
  if (!isConnected) return <ExtensionNotConnected />;

  return (
    <>
      <HeadTag />
      <div className='flex min-h-screen w-screen flex-col'>
        <Header />
        <main className='flex size-full flex-1 px-4'>
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};
