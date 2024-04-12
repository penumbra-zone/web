import { CondensedBlockSyncStatus } from '@penumbra-zone/ui/components/ui/block-sync-status/condensed';
import { useSyncProgress } from '../../../hooks/full-sync-height';

export const BlockSync = () => {
  const { latestBlockHeight, fullSyncHeight, error } = useSyncProgress();

  return (
    <CondensedBlockSyncStatus
      fullSyncHeight={fullSyncHeight}
      latestKnownBlockHeight={latestBlockHeight}
      error={error}
    />
  );
};
