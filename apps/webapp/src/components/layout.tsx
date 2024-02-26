import { LoaderFunction, Outlet, useLoaderData } from 'react-router-dom';
import { HeadTag } from './metadata/head-tag';
import { Header } from './header/header';
import { Toaster } from '@penumbra-zone/ui';
import '@penumbra-zone/ui/styles/globals.css';
import { isExtensionInstalled } from '../utils/is-connected';
import { getChainId } from '../fetchers/chain-id';
import { ExtensionNotInstalled } from './extension-not-installed';

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
  const { isInstalled } = useLoaderData() as LayoutLoaderResult;

  if (!isInstalled) return <ExtensionNotInstalled />;

  return (
    <>
      <HeadTag />
      <div className='relative flex min-h-screen flex-col bg-background text-muted'>
        <Header />
        <main className='mx-auto w-full flex-1 px-6 pb-4 pt-10 md:px-[88px] md:pb-0 xl:max-w-[1276px] xl:px-12'>
          <Outlet />
        </main>
      </div>
      <Toaster />
    </>
  );
};
