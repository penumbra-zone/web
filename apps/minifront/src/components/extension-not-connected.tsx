import { Button } from '@repo/ui/components/ui/button';
import { Toaster } from '@repo/ui/components/ui/toaster';
import { SplashPage } from '@repo/ui/components/ui/splash-page';
import { HeadTag } from './metadata/head-tag';
import { useMemo } from 'react';
import { createPenumbraClient } from '@penumbra-zone/client';

export const ExtensionNotConnected = () => {
  const penumbraClient = useMemo(() => createPenumbraClient(), []);

  return (
    <>
      <HeadTag />
      <Toaster />
      <SplashPage title='Connect to Penumbra'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          <div>To get started, connect the Penumbra Chrome extension.</div>
          <Button variant='gradient' onClick={() => void penumbraClient.connect()}>
            Connect
          </Button>
        </div>
      </SplashPage>
    </>
  );
};
