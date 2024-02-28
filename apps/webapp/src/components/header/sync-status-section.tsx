import { useStream } from '../../fetchers/stream';
import { useMemo } from 'react';
import { viewClient } from '../../clients/grpc';
import { BlockSyncStatus } from '@penumbra-zone/ui';
import { BlockSyncErrorState } from '@penumbra-zone/ui/components/ui/block-sync-status/error-state';

export const SyncStatusSection = () => {
  const syncStream = useMemo(() => viewClient.statusStream({}), []);
  const { data, error } = useStream(syncStream);

  return (
    <div className='mt-4 w-full flex-1 px-6 md:mx-auto md:mt-0 md:px-[88px] md:pb-0 xl:max-w-[1276px] xl:px-12'>
      {error ? (
        <BlockSyncErrorState />
      ) : (
        <BlockSyncStatus
          size='condensed'
          background='stone'
          fullSyncHeight={data?.fullSyncHeight ? Number(data.fullSyncHeight) : undefined}
          latestKnownBlockHeight={
            data?.latestKnownBlockHeight ? Number(data.latestKnownBlockHeight) : undefined
          }
        />
      )}
    </div>
  );
};
