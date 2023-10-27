'use client';

import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@penumbra-zone/ui';
import { BellIcon } from '../../icons';
import { FilledImage } from '../../shared';
import { viewClient } from '../../clients/grpc';
import { useStream } from '@penumbra-zone/transport';
import { BlockSync } from './block-sync';
import { useStore } from '../../state';
import { accountSelector } from '../../state/account';
import { StatusStreamResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

type NotificationState = 'sync' | 'notification' | 'none';

export default function Notifications() {
  const { isConnected } = useStore(accountSelector);
  const [status, setStatus] = useState<NotificationState>('none');
  const [syncStream, setSyncStream] = useState<AsyncIterable<StatusStreamResponse> | undefined>();

  useEffect(() => {
    if (!isConnected) return;
    setSyncStream(viewClient.statusStream({}));
  }, [isConnected]);

  const { data, error } = useStream(syncStream, isConnected);

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
  }, [data, error, isConnected]);

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
      <PopoverContent className='relative flex w-[400px] flex-col gap-10 bg-charcoal-secondary p-6'>
        <BlockSync data={data} />
      </PopoverContent>
    </Popover>
  );
}
