import { FC } from 'react';
import logoImg from './logo.svg?url';
import { Button } from '@repo/ui/Button';

export const Header: FC = () => {
  return (
    <header className='flex w-full justify-between py-4'>
      <img src={logoImg} alt="Penumbra" />
      <div>
        <Button>Connect</Button>
      </div>
    </header>
  )
};
