'use client';

import { Button } from '@penumbra-zone/ui';
import { stdClient } from '../../clients/std';

export default function ConnectButton() {
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
