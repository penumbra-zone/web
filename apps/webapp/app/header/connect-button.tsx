'use client';

import { Button } from '@penumbra-zone/ui';
import { stdClient } from '../../clients/std';

export default function ConnectButton() {
  return (
    <Button className='h-8 w-[140px]' onClick={() => void stdClient.connect()}>
      Connect Wallet
    </Button>
  );
}
