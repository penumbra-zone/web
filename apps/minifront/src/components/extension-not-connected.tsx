import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Toaster } from '@penumbra-zone/ui/components/ui/toaster';
import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';
import { errorToast, warningToast } from '@penumbra-zone/ui/lib/toast/presets';
import { HeadTag } from './metadata/head-tag';

import { requestPraxConnection } from '@penumbra-zone/client/prax';
import { useState } from 'react';
import { PenumbraAccessResponse } from '@penumbra-zone/client/messages';

const handleErr = (e: unknown) => {
  if (e instanceof Error && e.cause) {
    switch (e.cause) {
      case PenumbraAccessResponse.Denied:
        errorToast(
          'You may need to un-ignore this site in your extension settings.',
          'Connection denied',
        ).render();
        break;
      case PenumbraAccessResponse.NeedsLogin:
        warningToast(
          'Not logged in',
          'Please login into the extension and reload the page',
        ).render();
        break;
      default:
        errorToast(e, 'Connection error').render();
    }
  } else {
    console.warn('Unknown connection failure', e);
    errorToast(e, 'Unknown connection failure').render();
  }
};

const useRequestPraxConnection = () => {
  const [requested, setRequested] = useState<boolean>();

  const request = () => {
    void requestPraxConnection().then(
      () => location.reload(),
      e => handleErr(e),
    );
    setRequested(true);
  };

  return { request, requested };
};

export const ExtensionNotConnected = () => {
  const { request, requested } = useRequestPraxConnection();

  return (
    <>
      <HeadTag />
      <Toaster />
      <SplashPage title='Welcome to Penumbra'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          <div>To get started, connect the Penumbra Chrome extension.</div>
          {!requested ? (
            <Button variant='gradient' className='px-4' onClick={() => request()}>
              Connect
            </Button>
          ) : (
            <Button variant='gradient' className='px-4' onClick={() => location.reload()}>
              Reload
            </Button>
          )}
        </div>
      </SplashPage>
    </>
  );
};
