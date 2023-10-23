'use client';

import { Button } from '@penumbra-zone/ui';
import { stdClient } from '../../clients/std';

export default function ConnectButton() {
  return (
    <Button className='w-[140px] h-8' onClick={() => void stdClient.connect()}>
      Connect Wallet
    </Button>
  );
}
