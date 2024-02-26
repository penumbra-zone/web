import { useStream } from '../../fetchers/stream';
import { useMemo } from 'react';
import { viewClient } from '../../clients/grpc';
import { BlockSyncStatus } from '@penumbra-zone/ui';

export const SyncStatusSection = () => {
  const syncStream = useMemo(() => viewClient.statusStream({}), []);
  const { data, error } = useStream(syncStream);

  if (error) return <div className='text-red-600'>Error while retrieve block sync status</div>;

  return (
    <div className='mt-4 w-full flex-1 px-6 md:mx-auto md:mt-0 md:px-[88px] md:pb-0 xl:max-w-[1276px] xl:px-12'>
      <BlockSyncStatus
        size='condensed'
        background='stone'
        fullSyncHeight={data?.fullSyncHeight ? Number(data.fullSyncHeight) : undefined}
        latestKnownBlockHeight={
          data?.latestKnownBlockHeight ? Number(data.latestKnownBlockHeight) : undefined
        }
      />
    </div>
  );
};
