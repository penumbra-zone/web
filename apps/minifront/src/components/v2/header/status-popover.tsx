import { Blocks } from 'lucide-react';
import { Popover } from '@penumbra-zone/ui/Popover';
import { Button } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';
import { Pill } from '@penumbra-zone/ui/Pill';
import { Text } from '@penumbra-zone/ui/Text';
import { statusSelector, useStatus } from '../../../state/status.ts';
import { useMemo } from 'react';

export const StatusPopover = () => {
  const status = useStatus({
    select: statusSelector,
  });

  const pill = useMemo(() => {
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

  return (
    <Popover>
      <Popover.Trigger>
        <Button icon={Blocks} iconOnly>
          Status
        </Button>
      </Popover.Trigger>
      {status?.isCatchingUp !== undefined && (
        <Popover.Content align='end' side='bottom'>
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
