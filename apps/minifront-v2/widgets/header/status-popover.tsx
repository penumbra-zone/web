import { useMemo } from 'react';
import { Blocks } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Popover } from '@penumbra-zone/ui/Popover';
import { Button } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';
import { Pill } from '@penumbra-zone/ui/Pill';
import { Text } from '@penumbra-zone/ui/Text';
import { useAppParametersStore } from '@shared/stores/store-context';

export const StatusPopover = observer(() => {
  const appParametersStore = useAppParametersStore();
  // @ts-expect-error status property access
  const status = appParametersStore.status as
    | { syncHeight?: number; latestKnownBlockHeight?: number }
    | undefined;

  const pill = useMemo(() => {
    if (!status) {
      return <Pill context='technical-caution'>Loading...</Pill>;
    }

    if (
      status.syncHeight &&
      status.latestKnownBlockHeight &&
      status.syncHeight >= status.latestKnownBlockHeight
    ) {
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
      <Popover.Content align='end' side='bottom'>
        <Density compact>
          <div className='flex flex-col gap-4 text-text-primary'>
            <div className='flex flex-col gap-2'>
              <Text technical>Status</Text>
              {pill}
            </div>
            {status && (
              <div className='flex flex-col gap-2'>
                <Text technical>Block Height</Text>
                <Pill context='technical-default'>
                  {status.latestKnownBlockHeight !== status.syncHeight
                    ? `${status.syncHeight}${status.latestKnownBlockHeight ? ` of ${status.latestKnownBlockHeight}` : ''}`
                    : `${status.latestKnownBlockHeight}`}
                </Pill>
              </div>
            )}
          </div>
        </Density>
      </Popover.Content>
    </Popover>
  );
});
