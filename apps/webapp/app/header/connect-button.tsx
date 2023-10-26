'use client';

import { Button } from '@penumbra-zone/ui';
import { stdClient } from '../../clients/std';
import { useEffect } from 'react';

export default function ConnectButton() {
  useEffect(() => {
    void (async () => {
      console.log(await stdClient.isConnected());
    })();
  }, []);
  return (
    <Button
      className='w-[150px]'
      size='sm'
      variant='gradient'
      onClick={() => void stdClient.connect()}
    >
      Connect Wallet
    </Button>
  );
}
