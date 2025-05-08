import { ReactNode } from 'react';

import './v2.css';
import '@penumbra-zone/ui/style.css';

import { App } from './app';
import { fetchJsonRegistryWithGlobals } from '@/shared/api/fetch-registry';
import { getClientSideEnv } from '@/shared/api/env/getClientSideEnv';

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const { PENUMBRA_CHAIN_ID } = getClientSideEnv();
  const jsonRegistryWithGlobals = await fetchJsonRegistryWithGlobals(PENUMBRA_CHAIN_ID);
  return (
    <html lang='en'>
      <body>
        <App jsonRegistryWithGlobals={jsonRegistryWithGlobals}>{children}</App>
      </body>
    </html>
  );
};

export default RootLayout;
