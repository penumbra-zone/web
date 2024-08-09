import { Button } from '@repo/ui/components/ui/button';
import { Toaster } from '@repo/ui/components/ui/toaster';
import { SplashPage } from '@repo/ui/components/ui/splash-page';
import { errorToast, warningToast } from '@repo/ui/lib/toast/presets';
import { HeadTag } from './metadata/head-tag';

import { useState } from 'react';
import { PenumbraRequestFailure } from '@penumbra-zone/client';
import { penumbra } from '../prax';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const request = async () => {
    try {
      await penumbra.connect();
      navigate('/');
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
