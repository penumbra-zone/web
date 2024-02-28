import { useStream } from '../../fetchers/stream';
import { useMemo } from 'react';
import { viewClient } from '../../clients/grpc';
import { CondensedBlockSyncStatus } from '@penumbra-zone/ui';

export const SyncStatusSection = () => {
  const syncStream = useMemo(() => viewClient.statusStream({}), []);
  const { data, error } = useStream(syncStream);

  return (
    <div className='relative z-30 mt-[-30px] w-full'>
      <CondensedBlockSyncStatus
        fullSyncHeight={data?.fullSyncHeight ? Number(data.fullSyncHeight) : undefined}
        latestKnownBlockHeight={
          data?.latestKnownBlockHeight ? Number(data.latestKnownBlockHeight) : undefined
        }
        error={error}
      />
    </div>
  );
};
