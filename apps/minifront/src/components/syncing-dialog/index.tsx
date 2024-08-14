import { Dialog } from '@repo/ui/Dialog';
import { Status, useStatus } from '../../state/status';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { SyncAnimation } from './sync-animation';
import { Text } from '@repo/ui/Text';
import { useEffect, useState } from 'react';
import { useSyncProgress } from '@repo/ui/components/ui/block-sync-status';

type StatusSelector =
  | {
      isCatchingUp: false;
    }
  | {
      isCatchingUp: boolean;
      fullSyncHeight: bigint;
      latestKnownBlockHeight?: bigint;
      percentSynced?: string;
    };

// Copies the logic from the view service's `status` method.
const statusSelector = (zQueryState: AbridgedZQueryState<Status>): StatusSelector => {
  if (!zQueryState.data?.fullSyncHeight) {
    return { isCatchingUp: false };
  } else {
    const { fullSyncHeight, latestKnownBlockHeight } = zQueryState.data;
    const isCatchingUp = !latestKnownBlockHeight || latestKnownBlockHeight > fullSyncHeight;

    let percentSynced: string | undefined;
    if (latestKnownBlockHeight) {
      const percentSyncedNumber = Math.round(
        (Number(fullSyncHeight) / Number(latestKnownBlockHeight)) * 100,
      );
      percentSynced = `${percentSyncedNumber}%`;
    }

    return { isCatchingUp, fullSyncHeight, latestKnownBlockHeight, percentSynced };
  }
};

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
      <Dialog.Content title='Your client is syncing...'>
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
  return <Text technical>(Remaining {formattedTimeRemaining})</Text>;
};
