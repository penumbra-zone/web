import { LoaderFunction, Outlet } from 'react-router-dom';
import { HeadTag } from './metadata/head-tag.tsx';
import { Header } from './header/header.tsx';
import { Toaster } from '@penumbra-zone/ui/components/ui/toaster.tsx';
import '@penumbra-zone/ui/styles/globals.css';
import { isExtensionInstalled } from '../fetchers/is-connected.ts';
import { getChainId } from '../fetchers/chain-id.ts';

export type LayoutLoaderResult =
  | { isInstalled: false }
  | {
      isInstalled: true;
      chainId: string;
    };

export const LayoutLoader: LoaderFunction = async (): Promise<LayoutLoaderResult> => {
  const isInstalled = isExtensionInstalled();
  if (!isInstalled) return { isInstalled };
  const chainId = await getChainId();
  return { isInstalled, chainId };
};

export const Layout = () => {
  return (
    <>
      <HeadTag />
      <div className='relative flex min-h-screen flex-col bg-background text-muted'>
        <Header />
        <main className='flex-1 px-6 pb-4 pt-10 md:px-[88px] md:pb-0 xl:px-12'>
          <Outlet />
        </main>
      </div>
      <Toaster />
    </>
  );
};
