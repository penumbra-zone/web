import { Blocks } from 'lucide-react';
import { Popover, PopoverContext } from '@penumbra-zone/ui-deprecated/Popover';
import { Button } from '@penumbra-zone/ui-deprecated/Button';
import { Density } from '@penumbra-zone/ui-deprecated/Density';
import { Pill } from '@penumbra-zone/ui-deprecated/Pill';
import { Text } from '@penumbra-zone/ui-deprecated/Text';
import {
  statusStreamStateSelector,
  syncPercentSelector,
  useStatus,
} from '../../../state/status.ts';
import { useMemo } from 'react';
import { useStore } from '../../../state';

export const StatusPopover = () => {
  const sync = useStatus({ select: syncPercentSelector });
  const { error: streamError } = useStore(statusStreamStateSelector);

  // a ReactNode displaying the sync status in form of a pill
  const pill = useMemo(() => {
    if (sync?.percentSyncedNumber === undefined) {
      return null;
    }

    if (streamError) {
      return <Pill context='technical-destructive'>Block Sync Error</Pill>;
    }

    if (sync.percentSyncedNumber === 1) {
      return <Pill context='technical-success'>Blocks Synced</Pill>;
    }

    return <Pill context='technical-caution'>Block Syncing</Pill>;
  }, [sync, streamError]);

  const popoverContext = useMemo<PopoverContext>(() => {
    if (sync?.percentSyncedNumber === undefined) {
      return 'default';
    } else if (streamError) {
      return 'error';
    } else if (sync.percentSyncedNumber === 1) {
      return 'success';
    } else {
      return 'caution';
    }
  }, [sync, streamError]);

  return (
    <Popover>
      <Popover.Trigger>
        <Button icon={Blocks} iconOnly>
          Status
        </Button>
      </Popover.Trigger>
      {sync?.percentSyncedNumber !== undefined && (
        <Popover.Content context={popoverContext} align='end' side='bottom'>
          <Density compact>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <Text technical>Status</Text>
                {pill}
                {!!streamError && String(streamError)}
              </div>
              <div className='flex flex-col gap-2'>
                <Text technical>Block Height</Text>
                <Pill context='technical-default'>
                  {sync.data?.latestKnownBlockHeight !== sync.data?.fullSyncHeight
                    ? `${sync.data?.fullSyncHeight} of ${sync.data?.latestKnownBlockHeight}`
                    : `${sync.data?.latestKnownBlockHeight}`}
                </Pill>
              </div>
            </div>
          </Density>
        </Popover.Content>
      )}
    </Popover>
  );
};
