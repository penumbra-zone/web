'use client';
import { CompressedVideoLogo, FadeTransition } from '@penumbra-zone/ui';
import dynamic from 'next/dynamic';

const ConnectButton = dynamic(() => import('../../shared/connect-button'), {
  ssr: false,
});

const NotConnected = () => {
  return (
    <FadeTransition className='min-h-[calc(100vh-122px)]'>
      <div className='absolute inset-0 flex w-screen items-center justify-center'>
        <CompressedVideoLogo
          videoSrc='/ray-compressed.mp4'
          noWords
          className='w-[calc(100%-35vw)]'
        />
      </div>
      <div className='relative z-10 flex flex-col items-center gap-6'>
        <p className='bg-text-linear bg-clip-text font-headline text-[64px] font-bold leading-[64px] text-transparent'>
          Welcome users to Penumbra!
        </p>
        <p className='w-[50%] text-center text-base font-bold text-muted-foreground'>
          Penumbra is a shielded, cross-chain network allowing anyone to securely transact, stake,
          swap, or marketmake without broadcasting their personal information to the world.
        </p>
        <ConnectButton className='w-[300px]' size='lg' />
      </div>
    </FadeTransition>
  );
};

export default NotConnected;
