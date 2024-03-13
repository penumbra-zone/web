import { Button, SplashPage } from '@penumbra-zone/ui';
import { HeadTag } from './metadata/head-tag';

import { requestPraxConnection } from '@penumbra-zone/client';
import { useEffect, useState } from 'react';

export const ExtensionNotConnected = () => {
  const [approved, setApproved] = useState(undefined as boolean | undefined);
  const request = () =>
    void requestPraxConnection().then(
      () => setApproved(true),
      () => setApproved(false),
    );

  useEffect(() => {
    if (approved === true) location.reload();
    else document.title = 'Penumbra Minifront';
  }, [approved]);

  return (
    <>
      <HeadTag />
      <SplashPage title='Welcome to Penumbra'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          {approved !== false ? (
            <>
              <div>To get started, connect the Penumbra Chrome extension.</div>
              <Button variant='gradient' className='px-4' onClick={request}>
                Connect
              </Button>
            </>
          ) : (
            <>
              <div>
                <div className='text-destructive'>Connection failed - reload to try again.</div>
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
