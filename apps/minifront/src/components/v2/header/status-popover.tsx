import { Blocks } from 'lucide-react';
import { Popover, PopoverContext } from '@penumbra-zone/ui-deprecated/Popover';
import { Button } from '@penumbra-zone/ui-deprecated/Button';
import { Density } from '@penumbra-zone/ui-deprecated/Density';
import { Pill } from '@penumbra-zone/ui-deprecated/Pill';
import { Text } from '@penumbra-zone/ui-deprecated/Text';
import { statusSelector, useStatus } from '../../../state/status.ts';
import { useMemo } from 'react';

export const StatusPopover = () => {
  const status = useStatus({
    select: statusSelector,
  });

  // a ReactNode displaying the sync status in form of a pill
  const pill = useMemo(() => {
    // isCatchingUp is undefined when the status is not yet loaded
    if (status?.isCatchingUp === undefined) {
      return null;
    }

    if (status.error) {
      return <Pill context='technical-destructive'>Block Sync Error</Pill>;
    }

    if (status.percentSyncedNumber === 1) {
      return <Pill context='technical-success'>Blocks Synced</Pill>;
    }

    return <Pill context='technical-caution'>Block Syncing</Pill>;
  }, [status]);

  const popoverContext = useMemo<PopoverContext>(() => {
    if (status?.isCatchingUp === undefined) {
      return 'default';
    } else if (status.error) {
      return 'error';
    } else if (status.percentSyncedNumber === 1) {
      return 'success';
    } else {
      return 'caution';
    }
  }, [status]);

  return (
    <Popover>
      <Popover.Trigger>
        <Button icon={Blocks} iconOnly>
          Status
        </Button>
      </Popover.Trigger>
      {status?.isCatchingUp !== undefined && (
        <Popover.Content context={popoverContext} align='end' side='bottom'>
          <Density compact>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <Text technical>Status</Text>
                {pill}
                {!!status.error && String(status.error)}
              </div>
              <div className='flex flex-col gap-2'>
                <Text technical>Block Height</Text>
                <Pill context='technical-default'>
                  {status.latestKnownBlockHeight !== status.fullSyncHeight
                    ? `${status.fullSyncHeight} of ${status.latestKnownBlockHeight}`
                    : `${status.latestKnownBlockHeight}`}
                </Pill>
              </div>
            </div>
          </Density>
        </Popover.Content>
      )}
    </Popover>
  );
};
