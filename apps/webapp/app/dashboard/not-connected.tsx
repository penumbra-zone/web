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
      <div className='flex flex-col items-center gap-6 relative z-10'>
        <p className='text-[64px] leading-[64px] font-headline font-bold bg-text-linear bg-clip-text text-transparent'>
          Welcome users to Penumbra!
        </p>
        <p className='text-base font-bold text-muted-foreground w-[50%] text-center'>
          Penumbra is a shielded, cross-chain network allowing anyone to securely transact, stake,
          swap, or marketmake without broadcasting their personal information to the world.
        </p>
        <ConnectButton className='w-[300px]' size='lg' />
      </div>
    </FadeTransition>
  );
};

export default NotConnected;
