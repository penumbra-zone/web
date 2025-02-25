import { Dialog } from '@penumbra-zone/ui-deprecated/Dialog';
import { Text } from '@penumbra-zone/ui-deprecated/Text';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../state';
import { statusStreamStateSelector, useInitialStatus, useStatus } from '../../state/status';
import { BlockProgress } from './block-progress';
import { RemainingTime } from './remaining-time';
import { SyncAnimation } from './sync-animation';

export const SyncingDialog = () => {
  const initialStatus = useInitialStatus();
  const status = useStatus();
  const { error: streamError } = useStore(statusStreamStateSelector);

  const [isOpen, setIsOpen] = useState(false);
  const [didClose, setDidClose] = useState(false);
  const [dialogText, setDialogText] = useState<string | undefined>();

  const syncData = useMemo(
    () => ({ ...initialStatus.data, ...status.data }),
    [initialStatus.data, status.data],
  );

  const isSynced = useMemo(
    () =>
      syncData.fullSyncHeight &&
      syncData.latestKnownBlockHeight &&
      syncData.fullSyncHeight >= syncData.latestKnownBlockHeight,
    [syncData],
  );

  useEffect(() => {
    if (streamError) {
      setDialogText('Retrying...');
    } else if (!initialStatus.data) {
      setDialogText('Getting local block height...');
    } else if (!status.data) {
      setDialogText('Getting remote block height...');
    } else if (!isSynced) {
      setDialogText('Processing blocks to update local state...');
    }

    const shouldShow = !isSynced || !!streamError;
    setIsOpen(shouldShow && !didClose);
  }, [didClose, initialStatus.data, status.data, isSynced, streamError]);

  return (
    <Dialog isOpen={isOpen} onClose={() => setDidClose(true)}>
      <Dialog.Content title='Your client is syncing...' zIndex={9999}>
        <SyncAnimation />

        <div className='text-center'>
          <Text body>
            {dialogText}
            {!!streamError && (
              <Text technical color={theme => theme.caution.main} as='div'>
                {streamError instanceof Error ? streamError.message : String(streamError)}
              </Text>
            )}
            {!!(syncData.fullSyncHeight && syncData.latestKnownBlockHeight) && (
              <>
                <BlockProgress
                  fullSyncHeight={syncData.fullSyncHeight}
                  latestKnownBlockHeight={syncData.latestKnownBlockHeight}
                />
                <RemainingTime
                  fullSyncHeight={syncData.fullSyncHeight}
                  latestKnownBlockHeight={syncData.latestKnownBlockHeight}
                />
              </>
            )}
          </Text>
          <Text small as='p'>
            You can click away, but your data <i>may</i> not be current
          </Text>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
