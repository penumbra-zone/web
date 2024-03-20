import { Button, errorToast, SplashPage, Toaster, warningToast } from '@penumbra-zone/ui';
import { HeadTag } from './metadata/head-tag';

import {
  requestPraxConnection,
  throwIfPraxNotAvailable,
  throwIfPraxNotInstalled,
} from '@penumbra-zone/client';
import { useState } from 'react';
import { PenumbraRequestFailure } from '@penumbra-zone/client/src/global';

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
      throwIfPraxNotAvailable();
      await throwIfPraxNotInstalled();
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
      <SplashPage title='Welcome to Penumbra'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          <div>To get started, connect the Penumbra Chrome extension.</div>
          {!result ? (
            <Button variant='gradient' onClick={() => void request()} className='px-4'>
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
