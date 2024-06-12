import { CondensedBlockSyncStatus } from '@penumbra-zone/ui/components/ui/block-sync-status/condensed';
import { useStatus } from '../../state/status';

export const SyncStatusSection = () => {
  const { data, error } = useStatus();

  return (
    <div className='relative z-30 flex w-full flex-col'>
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
