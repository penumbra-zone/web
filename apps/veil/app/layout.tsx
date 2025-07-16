import { ReactNode } from 'react';
import { App } from './app';
import { fetchJsonRegistryWithGlobals } from '@/shared/api/fetch-registry';
import { getClientSideEnv } from '@/shared/api/env/getClientSideEnv';

import '@penumbra-zone/ui/style.css';
import '@penumbra-zone/ui/theme.css';
import './v2.css';

// We want to be able to always fetch the registry, hence: dynamic.
//
// Now, we could optimize this a lot. However, we immediately hit App
// which has "use client", so a lot more would need to be done to reap benefits here.
export const dynamic = 'force-dynamic';

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const clientEnv = getClientSideEnv();
  const jsonRegistryWithGlobals = await fetchJsonRegistryWithGlobals(clientEnv.PENUMBRA_CHAIN_ID);
  return (
    <html lang='en'>
      <body className='scroll-area-page'>
        <App clientEnv={clientEnv} jsonRegistryWithGlobals={jsonRegistryWithGlobals}>
          {children}
        </App>
      </body>
    </html>
  );
};

export default RootLayout;
