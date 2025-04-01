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
  const stream = useStore(statusStreamStateSelector);

  const [didClose, setDidClose] = useState<boolean>(false);

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
    () => stream.error instanceof ConnectError && stream.error.code === Code.Unavailable,
    [stream.error],
  );

  const dialogText = useMemo(() => {
    let detail: string;

    if (isUnavailable) {
      detail = 'Connection unavailable.';
    } else if (stream.error) {
      detail = 'Retrying...';
    } else if (!initialStatus.data) {
      detail = 'Querying local block height...';
    } else if (!status.data) {
      detail = 'Fetching remote block height...';
    } else if (!isSynced) {
      detail = 'Decrypting block stream...';
    } else {
      detail = 'This dialog should not be visible.';
    }

    let errorMessage: string;
    if (!(stream.error instanceof Error)) {
      errorMessage = String(stream.error);
    } else if (stream.error instanceof ConnectError) {
      errorMessage = stream.error.rawMessage;
    } else {
      errorMessage = stream.error.message;
    }

    return {
      title: stream.error ? 'Syncing interrupted' : 'Syncing...',
      error: errorMessage,
      instructions: isUnavailable
        ? 'Please reload the page.'
        : 'You can click away, but your data may not be current.',
      detail,
    };
  }, [initialStatus.data, isSynced, isUnavailable, status.data, stream.error]);

  return (
    <Dialog isOpen={!didClose && (!isSynced || !!stream.error)} onClose={() => setDidClose(true)}>
      <Dialog.Content title={dialogText.title} zIndex={9999}>
        <div className='p-16'>
          <SyncAnimation error={stream.error} running={stream.running} />

          <div className='text-center'>
            {dialogText.error && globalThis.__DEV__ && (
              <Text technical color={theme => theme.caution.main} as='div'>
                Error: {dialogText.error}
              </Text>
            )}
          </div>

          <div className='text-center'>
            <Text body as='p'>
              {dialogText.detail}
            </Text>
            <Text small as='p'>
              {dialogText.instructions}
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
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
