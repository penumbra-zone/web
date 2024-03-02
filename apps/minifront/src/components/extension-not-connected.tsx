import { Button, SplashPage } from '@penumbra-zone/ui';
import { HeadTag } from './metadata/head-tag';

import { requestPraxConnection } from '@penumbra-zone/client/prax';
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
  }, [approved]);

  return (
    <>
      <HeadTag />
      <SplashPage title='Welcome to Penumbra'>
        <div className='flex items-center justify-between gap-4'>
          {approved !== false ? (
            <p> To get started, connect the Penumbra Chrome extension. </p>
          ) : (
            <div>
              <p className='text-red-500'>Connection failed - reload to try again.</p>
              <p>You may need to un-ignore this site in your extension settings.</p>
            </div>
          )}
          {approved !== false ? (
            <Button variant='gradient' className='px-4 text-white' onClick={request}>
              Connect
            </Button>
          ) : (
            <Button
              variant='gradient'
              className='px-4 text-white'
              onClick={() => location.reload()}
            >
              Reload
            </Button>
          )}
        </div>
      </SplashPage>
    </>
  );
};
