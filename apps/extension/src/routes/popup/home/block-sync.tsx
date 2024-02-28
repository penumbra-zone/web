import { BlockSyncStatus } from '@penumbra-zone/ui';
import { useSyncProgress } from '../../../hooks/full-sync-height';

export const BlockSync = () => {
  const { latestBlockHeight, fullSyncHeight } = useSyncProgress();

  return (
    <BlockSyncStatus
      fullSyncHeight={fullSyncHeight}
      latestKnownBlockHeight={latestBlockHeight}
      showLoadingState={false}
    />
  );
};
