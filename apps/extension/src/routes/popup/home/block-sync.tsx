import { BlockSyncStatus } from '@penumbra-zone/ui';
import { useSyncProgress } from '../../../hooks/last-block-synced';

export const BlockSync = () => {
  const { lastBlockHeight, lastBlockSynced } = useSyncProgress();
  if (!lastBlockHeight) return <></>;

  return <BlockSyncStatus lastBlockSynced={lastBlockSynced} lastBlockHeight={lastBlockHeight} />;
};
