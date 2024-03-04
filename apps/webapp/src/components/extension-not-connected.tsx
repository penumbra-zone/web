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
          To get started, connect the Penumbra Chrome extension.
          <Button
            disabled={approved === false}
            variant='gradient'
            className='px-4 text-white'
            onClick={request}
          >
            Connect
          </Button>
        </div>
        {approved === false ? (
          <div className='text-red-500'>Connection was denied - reload the page and try again.</div>
        ) : null}
      </SplashPage>
    </>
  );
};
