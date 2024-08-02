import { Dialog } from '@repo/ui/Dialog';
import { Status, useStatus } from '../../state/status';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { SyncAnimation } from './sync-animation';
import { Text } from '@repo/ui/Text';
import { useEffect, useState } from 'react';

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
          <Text p>Updating your local state with public state.</Text>
          {!!status?.isCatchingUp && (
            <Text technical>
              {!!status.percentSynced && `${status.percentSynced} Synced – `} Block{' '}
              {status.fullSyncHeight.toString()}{' '}
              {!!status.latestKnownBlockHeight && `of ${status.latestKnownBlockHeight.toString()}`}
            </Text>
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
