import { SyncingState } from './syncing-state';
import { FullySyncedState } from './fully-synced-state';
import { AwaitingSyncState } from './awaiting-sync-state';

export interface BlockSyncProps {
  latestKnownBlockHeight?: number;
  fullSyncHeight?: number;
  background?: 'black' | 'stone';
  size?: 'large' | 'condensed';
  showLoadingState?: boolean;
}

export const BlockSyncStatus = ({
  latestKnownBlockHeight,
  fullSyncHeight,
  background,
  size,
  showLoadingState = true,
}: BlockSyncProps) => {
  if (!latestKnownBlockHeight || !fullSyncHeight) {
    if (showLoadingState) return <AwaitingSyncState size={size} />;
    return <div></div>;
  }

  const isSyncing = latestKnownBlockHeight - fullSyncHeight > 10;

  return (
    <div className='flex w-full select-none flex-col items-center leading-[30px]'>
      {isSyncing ? (
        <SyncingState
          latestKnownBlockHeight={latestKnownBlockHeight}
          fullSyncHeight={fullSyncHeight}
          background={background}
          size={size}
        />
      ) : (
        <FullySyncedState
          latestKnownBlockHeight={latestKnownBlockHeight}
          fullSyncHeight={fullSyncHeight}
          background={background}
          size={size}
        />
      )}
    </div>
  );
};
