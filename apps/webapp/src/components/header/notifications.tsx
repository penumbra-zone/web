import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@penumbra-zone/ui';
import { BellIcon } from '../../icons';
import { useStream } from '@penumbra-zone/transport';
import { BlockSync } from './block-sync';
import { viewClient } from '../../clients/grpc.ts';

type NotificationState = 'sync' | 'notification' | 'none';

export default function Notifications() {
  const [status, setStatus] = useState<NotificationState>('none');
  const syncStream = useMemo(() => viewClient.statusStream({}), []);
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
              <img
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
