import { Dialog } from '@penumbra-zone/ui-deprecated/Dialog';
import { Text } from '@penumbra-zone/ui-deprecated/Text';
import { useMemo, useState } from 'react';
import { useStore } from '../../state';
import { statusStreamStateSelector, useInitialStatus, useStatus } from '../../state/status';
import { BlockProgress } from './block-progress';
import { RemainingTime } from './remaining-time';
import { SyncAnimation } from './sync-animation';
import { Code, ConnectError } from '@connectrpc/connect';

export const SyncingDialog = () => {
  const initialStatus = useInitialStatus();
  const status = useStatus();
  const { error: streamError } = useStore(statusStreamStateSelector);

  const [didClose, setDidClose] = useState(false);

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

  const isUnavailable = useMemo(
    () => streamError instanceof ConnectError && streamError.code === Code.Unavailable,
    [streamError],
  );

  const dialogErrorMessage = useMemo(() => {
    if (streamError instanceof ConnectError) {
      return streamError.rawMessage;
    } else if (streamError instanceof Error) {
      return streamError.message;
    } else if (streamError != null) {
      return String(streamError);
    } else {
      return null;
    }
  }, [streamError]);

  /** @todo do we need to show all of these distinct states? */
  const dialogSyncingText = useMemo(() => {
    if (isUnavailable) {
      return 'Connection unavailable.';
    } else if (streamError != null) {
      return 'Retrying...';
    } else if (!initialStatus.data) {
      return 'Querying local block height...';
    } else if (!status.data) {
      return 'Fetching remote block height...';
    } else if (!isSynced) {
      return 'Decrypting block stream...';
    } else {
      return 'If you can read this, something is broken.';
    }
  }, [isUnavailable, streamError, initialStatus.data, status.data, isSynced]);

  const dialogInstructionsText = useMemo(
    () =>
      isUnavailable
        ? 'Please reload the page.'
        : 'You can click away, but your data may not be current.',
    [isUnavailable],
  );

  return (
    <Dialog isOpen={(!isSynced || !!streamError) && !didClose} onClose={() => setDidClose(true)}>
      <Dialog.Content
        title={streamError != null ? 'Syncing interrupted' : 'Syncing...'}
        zIndex={9999}
      >
        <div className='text-center'>
          {streamError != null && globalThis.__DEV__ && (
            <Text technical color={theme => theme.caution.main} as='div'>
              Error: {dialogErrorMessage}
            </Text>
          )}
        </div>

        <SyncAnimation pause={!!streamError} />

        <div className='text-center'>
          <Text body as='p'>
            {dialogSyncingText}
          </Text>
          <Text small as='p'>
            {dialogInstructionsText}
          </Text>
          {!!(syncData.fullSyncHeight && syncData.latestKnownBlockHeight) && (
            <div className='mt-6'>
              <BlockProgress
                fullSyncHeight={syncData.fullSyncHeight}
                latestKnownBlockHeight={syncData.latestKnownBlockHeight}
              />
              <RemainingTime
                fullSyncHeight={syncData.fullSyncHeight}
                latestKnownBlockHeight={syncData.latestKnownBlockHeight}
              />
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
