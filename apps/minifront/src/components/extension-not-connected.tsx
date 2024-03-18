import { Button, SplashPage } from '@penumbra-zone/ui';
import { HeadTag } from './metadata/head-tag';

import { requestPraxConnection } from '@penumbra-zone/client';
import { useState } from 'react';

const useExtConnector = () => {
  const [err, setErr] = useState<string>();

  const request = async () => {
    try {
      await requestPraxConnection();
      location.reload();
    } catch (e) {
      setErr(String(e));
    }
  };

  return { request, err };
};

export const ExtensionNotConnected = () => {
  const { request, err } = useExtConnector();

  return (
    <>
      <HeadTag />
      <SplashPage title='Welcome to Penumbra'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          {!err ? (
            <>
              <div>To get started, connect the Penumbra Chrome extension.</div>
              <Button variant='gradient' onClick={() => void request()} className='px-4'>
                Connect
              </Button>
            </>
          ) : (
            <>
              <div>
                <div className='italic text-destructive'>Error: {err}</div>
                <div>You may need to un-ignore this site in your extension settings.</div>
              </div>
              <Button variant='gradient' className='px-4' onClick={() => location.reload()}>
                Reload
              </Button>
            </>
          )}
        </div>
      </SplashPage>
    </>
  );
};
