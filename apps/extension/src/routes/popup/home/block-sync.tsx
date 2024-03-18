import { LargeBlockSyncStatus } from '@penumbra-zone/ui/components/ui/block-sync-status';
import { useSyncProgress } from '../../../hooks/full-sync-height';

export const BlockSync = () => {
  const { latestBlockHeight, fullSyncHeight, error } = useSyncProgress();

  return (
    <LargeBlockSyncStatus
      fullSyncHeight={fullSyncHeight}
      latestKnownBlockHeight={latestBlockHeight}
      error={error}
    />
  );
};
