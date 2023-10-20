'use client';

import { Button } from '@penumbra-zone/ui';
import { stdClient } from '../../clients/std';

export const ConnectButton = () => {
  return (
    <Button className='w-[140px]' onClick={() => void stdClient.openWindow()}>
      Connect Wallet
    </Button>
  );
};
