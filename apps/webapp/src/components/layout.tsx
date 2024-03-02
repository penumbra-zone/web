import { LoaderFunction, Outlet, useLoaderData } from 'react-router-dom';
import { getChainId } from '../fetchers/chain-id';
import { HeadTag } from './metadata/head-tag';
import { Header } from './header/header';
import { Toaster } from '@penumbra-zone/ui';
import '@penumbra-zone/ui/styles/globals.css';
import { ExtensionNotConnected } from './extension-not-connected';
import { ExtensionNotInstalled } from './extension-not-installed';
import { Footer } from './footer';
import {
  isPraxAvailable,
  isPraxConnected,
  isPraxConnectedTimeout,
} from '@penumbra-zone/client/prax';

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
      <div className='relative flex min-h-screen flex-col bg-background text-muted'>
        <Header />
        <main className='mx-auto w-full flex-1 px-6 pb-4 pt-5 md:px-[88px] md:pb-0 xl:max-w-[1276px] xl:px-12'>
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};
