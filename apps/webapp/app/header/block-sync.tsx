'use client';

import { FilledImage } from '../../shared';
import { Progress } from 'ui';
import { StatusStreamResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { CheckIcon } from '@radix-ui/react-icons';

interface BlockSyncProps {
  data: StatusStreamResponse | undefined;
}

export const BlockSync = ({ data }: BlockSyncProps) => {
  if (!data) return;
  const syncHeight = Number(data.syncHeight);
  const latestKnownBlockHeight = Number(data.latestKnownBlockHeight);

  return (
    <>
      <div className='relative z-10 flex flex-col gap-2'>
        <div className='flex flex-col items-center justify-between text-base'>
          {
            // Is syncing ⏳
            // latestKnownBlockHeight - syncHeight > 10 ? (
            latestKnownBlockHeight - syncHeight < 10 ? (
              <>
                <div className='flex items-center gap-2'>
                  <FilledImage src='/sync-bold.svg' alt='Syncing blocks...' className='h-6 w-6' />
                  <p className='font-headline font-semibold'>Syncing blocks...</p>
                </div>
                <p className='font-mono'>
                  {syncHeight}/{latestKnownBlockHeight}
                </p>
                <Progress
                  variant='in-progress'
                  value={(syncHeight / latestKnownBlockHeight) * 100}
                />
              </>
            ) : (
              // Is synced ✅
              <>
                <div className='flex items-center gap-2 text-teal'>
                  <CheckIcon className='h-6 w-6' />
                  <p className='font-headline font-semibold'>Blocks synced</p>
                </div>
                <p className='font-mono font-bold'>
                  {syncHeight}/{latestKnownBlockHeight}
                </p>
                <Progress variant='done' value={(syncHeight / latestKnownBlockHeight) * 100} />
              </>
            )
          }
        </div>
      </div>
    </>
  );
};
