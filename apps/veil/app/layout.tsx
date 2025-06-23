// We want to be able to always fetch the registry, hence: dynamic.
//
// Now, we could optimize this a lot. However, we immediately hit App
// which has "use client", so a lot more would need to be done to reap benefits here.
export const dynamic = 'force-dynamic';

import { ReactNode } from 'react';

import '@penumbra-zone/ui/theme.css';
import '@penumbra-zone/ui/style.css';
import './v2.css';

import { App } from './app';
import { fetchJsonRegistryWithGlobals } from '@/shared/api/fetch-registry';
import { getClientSideEnv } from '@/shared/api/env/getClientSideEnv';

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const { PENUMBRA_CHAIN_ID } = getClientSideEnv();
  const jsonRegistryWithGlobals = await fetchJsonRegistryWithGlobals(PENUMBRA_CHAIN_ID);
  return (
    <html lang='en'>
      <body className='scroll-area-page'>
        <App jsonRegistryWithGlobals={jsonRegistryWithGlobals}>{children}</App>
      </body>
    </html>
  );
};

export default RootLayout;
