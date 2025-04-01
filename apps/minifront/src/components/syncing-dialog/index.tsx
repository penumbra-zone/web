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
  const streamStatus = useStatus();
  const { error: streamError } = useStore(statusStreamStateSelector);

  const [didClose, setDidClose] = useState(false);

  const { fullSyncHeight = 0n, latestKnownBlockHeight = 0n } = useMemo(
    () => ({ ...initialStatus.data, ...streamStatus.data }),
    [initialStatus.data, streamStatus.data],
  );

  const isSynced = useMemo(
    () => latestKnownBlockHeight > 0n && fullSyncHeight >= latestKnownBlockHeight,
    [fullSyncHeight, latestKnownBlockHeight],
  );

  const isUnavailable = useMemo(
    () => streamError instanceof ConnectError && streamError.code === Code.Unavailable,
    [streamError],
  );

  const dialogText = useMemo(() => {
    const title = `Syncing ${streamError ? 'interrupted' : '. . .'}`;

    let error = '';
    if (globalThis.__DEV__ && streamError) {
      error = String(streamError);
      if (streamError instanceof Error) {
        error = streamError instanceof ConnectError ? streamError.rawMessage : streamError.message;
      }
    }

    let detail = 'This dialog should not be visible.';
    if (!didClose) {
      if (isUnavailable) {
        detail = 'Connection unavailable.';
      } else if (streamError) {
        detail = 'Retrying...';
      } else if (!initialStatus.data) {
        detail = 'Querying local block height...';
      } else if (!streamStatus.data) {
        detail = 'Fetching remote block height...';
      } else if (!isSynced) {
        detail = 'Decrypting block stream...';
      } else {
        detail = 'Unknown state.';
      }
    }

    const instructions = isUnavailable
      ? 'Please reload the page.'
      : 'You can click away, but your data may not be current.';

    return { title, error, detail, instructions };
  }, [didClose, initialStatus.data, isSynced, isUnavailable, streamStatus.data, streamError]);

  return (
    <Dialog isOpen={!didClose && (!isSynced || !!streamError)} onClose={() => setDidClose(true)}>
      <Dialog.Content title={dialogText.title}>
        <div className='text-center'>
          {dialogText.error && (
            <Text technical color={theme => theme.caution.main} as='div'>
              Error: {dialogText.error}
            </Text>
          )}
        </div>

        <SyncAnimation />

        <div className='text-center'>
          <Text body as='p'>
            {dialogText.detail}
          </Text>
          <Text small as='p'>
            {dialogText.instructions}
          </Text>
          {!!streamStatus.data && (
            <div className='mt-6'>
              <BlockProgress
                fullSyncHeight={fullSyncHeight}
                latestKnownBlockHeight={latestKnownBlockHeight}
              />
              <RemainingTime
                fullSyncHeight={fullSyncHeight}
                latestKnownBlockHeight={latestKnownBlockHeight}
              />
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
