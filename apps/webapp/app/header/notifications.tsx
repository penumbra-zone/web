'use client';

import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from 'ui';
import { cn } from 'ui/lib/utils';
import { BellIcon } from '../../icons';
import { FilledImage } from '../../shared';
import { grpcClient } from '../../extension-client';
import { useStream } from 'penumbra-transport';
import { BlockSync } from './block-sync';

const txs = [
  {
    type: 'Send',
    amount: 120,
    asset: 'penumbra',
    status: 'pending',
    date: new Date(),
  },
  {
    type: 'Send',
    amount: 120,
    asset: 'penumbra',
    status: 'confirmed',
    date: new Date(),
  },
  {
    type: 'Send',
    amount: 120,
    asset: 'penumbra',
    status: 'failed',
    date: new Date(),
  },
  {
    type: 'Send',
    amount: 120,
    asset: 'penumbra',
    status: 'failed',
    date: new Date(),
  },
];

type NotificationState = 'sync' | 'notification' | 'none';

export default function Notifications() {
  const [status, setStatus] = useState<NotificationState>('none');
  const syncStream = useMemo(() => grpcClient.statusStream({}), []);
  const { data, error } = useStream(syncStream);

  useEffect(() => {
    if (error) {
      setStatus('notification');
    } else if (data) {
      if (data.latestKnownBlockHeight - data.syncHeight > 10) {
        setStatus('sync');
      } else {
        setStatus('none');
      }
    }
  }, [data, error]);

  return (
    <Popover>
      <PopoverTrigger className='relative'>
        {status !== 'none' && (
          <>
            {status === 'notification' ? (
              <div className='absolute right-[2px] top-[5px] z-10 h-[11px] w-[11px] rounded-full bg-red'></div>
            ) : (
              <FilledImage
                src='/sync-bold.svg'
                alt='Syncing blocks...'
                className='absolute right-[2px] top-[5px] z-10 h-[15px] w-[15px]'
              />
            )}
          </>
        )}
        <div className='h-[30px] w-[30px]'>
          <BellIcon stroke={status === 'sync' ? '#363434' : '#BDB8B8'} />
        </div>
      </PopoverTrigger>
      <PopoverContent className='relative flex w-[400px] flex-col gap-10 bg-charcoal-secondary px-[30px] pb-[46px] pt-5'>
        <BlockSync data={data} />
        <div className='relative z-10 flex flex-col gap-4'>
          <p className='font-headline text-lg font-semibold leading-6 text-muted'>Transactions</p>
          <div className='flex max-h-[240px] flex-col gap-4 overflow-auto'>
            {txs.map((i, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex gap-2 font-bold'>
                  <ArrowTopRightIcon className='h-5 w-5' />
                  <div className='flex flex-col items-start'>
                    <p>{`${i.type} ${i.amount} ${i.asset}`}</p>
                    <p className='text-xs leading-[18px]'>Aug.31st 12:32pm</p>
                  </div>
                </div>
                <p
                  className={cn(
                    'font-bold capitalize',
                    i.status === 'failed' && 'text-red',
                    i.status === 'confirmed' && 'text-green',
                  )}
                >
                  {i.status}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className='absolute inset-0 z-0 bg-card-radial opacity-20' />
      </PopoverContent>
    </Popover>
  );
}
