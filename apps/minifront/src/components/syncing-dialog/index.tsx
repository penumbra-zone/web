import { Dialog } from '@penumbra-zone/ui-deprecated/Dialog';
import { statusSelector, useStatus } from '../../state/status';
import { SyncAnimation } from './sync-animation';
import { Text } from '@penumbra-zone/ui-deprecated/Text';
import { useEffect, useState } from 'react';
import { useSyncProgress } from '@penumbra-zone/ui-deprecated/components/ui/block-sync-status';

export const SyncingDialog = () => {
  const status = useStatus({
    select: statusSelector,
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (status?.isCatchingUp) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [status?.isCatchingUp]);

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Dialog.Content title='Your client is syncing...' zIndex={9999}>
        <SyncAnimation />

        <div className='text-center'>
          <Text body as='p'>
            Decrypting blocks to update your local state
          </Text>
          <Text small as='p'>
            You can click away, but your data <i>may</i> not be current
          </Text>
          <div className='mt-6'>
            {!!status?.isCatchingUp && (
              <Text technical>
                {!!status.percentSynced && `${status.percentSynced} Synced – `} Block{' '}
                {status.fullSyncHeight.toString()}{' '}
                {!!status.latestKnownBlockHeight &&
                  `of ${status.latestKnownBlockHeight.toString()}`}
              </Text>
            )}
          </div>
          {!!status?.isCatchingUp && status.latestKnownBlockHeight ? (
            <RemainingTime
              fullSyncHeight={status.fullSyncHeight}
              latestKnownBlockHeight={status.latestKnownBlockHeight}
            />
          ) : null}
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

const RemainingTime = ({
  fullSyncHeight,
  latestKnownBlockHeight,
}: {
  fullSyncHeight: bigint;
  latestKnownBlockHeight: bigint;
}) => {
  const { formattedTimeRemaining } = useSyncProgress(fullSyncHeight, latestKnownBlockHeight);
  return <Text technical>(Estimated time remaining: {formattedTimeRemaining})</Text>;
};
