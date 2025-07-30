import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { Density } from '@penumbra-zone/ui/Density';
import { useStatusStore } from '@/shared/stores/store-context';
import { BlockProgress } from './block-progress';
import { RemainingTime } from './remaining-time';
import { SyncAnimation } from './sync-animation';

export const SyncingDialog = observer(() => {
  const statusStore = useStatusStore();

  // Contains the relevant error value if closed during an error state
  const [didClose, setDidClose] = useState<Error | boolean>(false);

  const syncStatus = statusStore.syncStatus;
  const currentError = statusStore.currentError;

  const isSynced = useMemo(() => statusStore.isSynced, [statusStore.isSynced]);

  const isUnavailable = useMemo(
    () => statusStore.hasConnectionError,
    [statusStore.hasConnectionError],
  );

  const isOpen = useMemo(() => {
    if (didClose) {
      // The dialog should be able to reopen after certain conditions are met
      if (
        isSynced &&
        !currentError // syncing has reached present AND no error
      ) {
        setDidClose(false);
      } else if (
        currentError instanceof Error && // an error is present now, and
        (!(didClose instanceof Error) || // the dialog was not closed during an error, or
          currentError.message !== didClose.message) // the error has changed since it was closed
      ) {
        setDidClose(false);
      }
    }

    // Show dialog if: not manually closed AND (not synced OR has error)
    return !didClose && (!isSynced || !!currentError);
  }, [didClose, isSynced, currentError]);

  const dialogText = useMemo(() => {
    const title = `Syncing ${currentError ? 'interrupted' : '...'}`;

    let error = '';
    if (currentError) {
      error = currentError.message;
    }

    let subheading = 'This dialog should not be visible.';
    if (!didClose) {
      if (isUnavailable) {
        subheading = 'Connection unavailable.';
      } else if (currentError) {
        subheading = 'Retrying...';
      } else if (!statusStore.initialStatus) {
        subheading = 'Querying local block height...';
      } else if (!statusStore.statusStream) {
        subheading = 'Fetching remote block height...';
      } else if (!isSynced) {
        subheading = 'Decrypting block stream...';
      } else {
        subheading = 'Unknown state.';
      }
    }

    const text = 'All of your private data is local.';
    const instructions = isUnavailable ? 'Please reload the page.' : 'You can leave this tab open.';

    return { title, error, subheading, text, instructions };
  }, [
    didClose,
    statusStore.initialStatus,
    isSynced,
    isUnavailable,
    statusStore.statusStream,
    currentError,
  ]);

  return (
    <Dialog isOpen={isOpen} onClose={() => setDidClose(currentError ?? true)}>
      <Dialog.Content title={dialogText.title}>
        <Density compact>
          <div className='text-center'>
            {dialogText.error && (
              <Text technical color='text.secondary' as='div' className='text-destructive-light'>
                Error: {dialogText.error}
              </Text>
            )}
          </div>

          <SyncAnimation />

          <div className='text-center'>
            <Text as='p'>{dialogText.subheading}</Text>
            <Text detail as='p'>
              {dialogText.text}
            </Text>
            <Text detail as='p'>
              {dialogText.instructions}
            </Text>
            {syncStatus && !statusStore.hasConnectionError && (
              <div className='mt-6'>
                <BlockProgress
                  syncHeight={syncStatus.syncHeight}
                  latestKnownBlockHeight={syncStatus.latestKnownBlockHeight}
                />
                <RemainingTime
                  syncHeight={syncStatus.syncHeight}
                  latestKnownBlockHeight={syncStatus.latestKnownBlockHeight}
                />
              </div>
            )}
          </div>
        </Density>
      </Dialog.Content>
    </Dialog>
  );
});
