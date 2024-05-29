import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Toaster } from '@penumbra-zone/ui/components/ui/toaster';
import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';
import { errorToast, warningToast } from '@penumbra-zone/ui/lib/toast/presets';
import { HeadTag } from './metadata/head-tag';

import { requestPraxConnection } from '@penumbra-zone/client/prax';
import { useState } from 'react';
import { PenumbraRequestFailure } from '@penumbra-zone/client';

const handleErr = (e: unknown) => {
  if (e instanceof Error && e.cause) {
    switch (e.cause) {
      case PenumbraRequestFailure.Denied:
        errorToast(
          'You may need to un-ignore this site in your extension settings.',
          'Connection denied',
        ).render();
        break;
      case PenumbraRequestFailure.NeedsLogin:
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

const useExtConnector = () => {
  const [result, setResult] = useState<boolean>();

  const request = async () => {
    try {
      await requestPraxConnection();
      location.reload();
    } catch (e) {
      handleErr(e);
    } finally {
      setResult(true);
    }
  };

  return { request, result };
};

export const ExtensionNotConnected = () => {
  const { request, result } = useExtConnector();

  return (
    <>
      <HeadTag />
      <Toaster />
      <SplashPage title='Connect to Penumbra'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          <div>To get started, connect the Penumbra Chrome extension.</div>
          {!result ? (
            <Button variant='gradient' onClick={() => void request()}>
              Connect
            </Button>
          ) : (
            <Button variant='gradient' onClick={() => location.reload()}>
              Reload
            </Button>
          )}
        </div>
      </SplashPage>
    </>
  );
};
