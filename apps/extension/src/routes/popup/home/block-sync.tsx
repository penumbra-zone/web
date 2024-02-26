import { BlockSyncStatus } from '@penumbra-zone/ui';
import { useSyncProgress } from '../../../hooks/full-sync-height';

export const BlockSync = () => {
  const { lastBlockHeight, fullSyncHeight } = useSyncProgress();

  return (
    <BlockSyncStatus
      fullSyncHeight={fullSyncHeight}
      latestKnownBlockHeight={lastBlockHeight}
      showLoadingState={false}
    />
  );
};
