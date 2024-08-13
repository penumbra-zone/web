import { FC } from 'react';
import { Button } from '@repo/ui/Button';

import logoImg from './logo.svg?url';
import { useConnect } from '../../shared/use-connect.ts';
import { prax } from '../../penumbra.ts';

export const Header: FC = () => {
  const { connected, installed, connect, disconnect } = useConnect();

  return (
    <header className='flex w-full justify-between py-4'>
      <img src={logoImg} alt="Penumbra" />
      <div>
        {!installed ? (
          <a href={prax.toString()} target='_blank'>
            <Button>Install Prax</Button>
          </a>
        ) : (
          <>
            {connected ? (
              <Button onClick={disconnect}>Disconnect</Button>
            ) : (
              <Button onClick={connect}>Connect</Button>
            )}
          </>
        )}
      </div>
    </header>
  )
};
