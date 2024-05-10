import { CondensedBlockSyncStatus } from '@penumbra-zone/ui/components/ui/block-sync-status/condensed';
import { AllSlices } from '../../state';
import { useStoreShallow } from '../../utils/use-store-shallow';

const syncStatusSectionSelector = (state: AllSlices) => ({
  fullSyncHeight: state.status.fullSyncHeight,
  latestKnownBlockHeight: state.status.latestKnownBlockHeight,
  error: state.status.error,
});

export const SyncStatusSection = () => {
  const { fullSyncHeight, latestKnownBlockHeight, error } =
    useStoreShallow(syncStatusSectionSelector);

  return (
    <div className='relative z-30 flex w-full flex-col'>
      <CondensedBlockSyncStatus
        fullSyncHeight={fullSyncHeight ? Number(fullSyncHeight) : undefined}
        latestKnownBlockHeight={latestKnownBlockHeight ? Number(latestKnownBlockHeight) : undefined}
        error={error}
      />
    </div>
  );
};
