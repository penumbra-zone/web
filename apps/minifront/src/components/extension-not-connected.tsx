import { Button, errorToast, SplashPage, Toaster, warningToast } from '@penumbra-zone/ui';
import { HeadTag } from './metadata/head-tag';

import { requestPraxConnection } from '@penumbra-zone/client';
import { useState } from 'react';
import { PraxConnectionRes } from '@penumbra-zone/client/src/global';

const useExtConnector = () => {
  const [result, setResult] = useState<boolean>();

  const request = async () => {
    try {
      const res = await requestPraxConnection();
      switch (res) {
        case PraxConnectionRes.Approved: {
          location.reload();
          break;
        }
        case PraxConnectionRes.Denied: {
          errorToast(
            'You may need to un-ignore this site in your extension settings.',
            'Connection denied',
          ).render();
          break;
        }
        case PraxConnectionRes.NotLoggedIn: {
          warningToast(
            'Not logged in',
            'Please login into the extension and reload the page',
          ).render();
          break;
        }
        case undefined: {
          throw new Error('Penumbra extension not installed');
        }
      }
    } catch (e) {
      errorToast(e, 'Connection failure').render();
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
