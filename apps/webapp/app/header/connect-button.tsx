'use client';

import { Button } from '@penumbra-zone/ui';
import { useConnect } from '../../hooks/connect';

export default function ConnectButton() {
  const { connect } = useConnect();

  return (
    <Button className='w-[150px]' size='sm' variant='gradient' onClick={() => void connect()}>
      Connect Wallet
    </Button>
  );
}
