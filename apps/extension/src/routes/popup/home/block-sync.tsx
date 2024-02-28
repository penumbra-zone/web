import { LargeBlockSyncStatus } from '@penumbra-zone/ui';
import { useSyncProgress } from '../../../hooks/full-sync-height';

export const BlockSync = () => {
  const { latestBlockHeight, fullSyncHeight } = useSyncProgress();

  return (
    <LargeBlockSyncStatus
      fullSyncHeight={fullSyncHeight}
      latestKnownBlockHeight={latestBlockHeight}
      showLoadingState={false}
    />
  );
};
