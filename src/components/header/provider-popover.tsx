import { useMemo } from 'react';
import { Link2Off } from 'lucide-react';
import Image from 'next/image';
import { Popover } from '@penumbra-zone/ui/Popover';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { connectionStore } from '@/shared/state/connection';
import { observer } from 'mobx-react-lite';

export const ProviderPopover = observer(() => {
  const { manifest } = connectionStore;

  const icon = useMemo(() => {
    const icons = (manifest?.icons ?? {}) as Record<string, Blob>;
    const blob = icons['32'] ?? icons['128'];
    const element = !blob ? null : (
      <Image
        width={16}
        height={16}
        src={URL.createObjectURL(blob)}
        alt={manifest?.name ?? ''}
        className='size-4'
      />
    );
    return () => element;
  }, [manifest]);

  return (
    <Popover>
      <Popover.Trigger>
        <Button icon={icon} iconOnly>
          {manifest?.name ?? ''}
        </Button>
      </Popover.Trigger>
      <Popover.Content align='end' side='bottom'>
        {manifest ? (
          <div className='flex flex-col gap-2'>
            <Text body>
              {manifest.name} v{manifest.version}
            </Text>
            <Text small>{manifest.description}</Text>
          </div>
        ) : (
          <Text body>Loading provider manifest...</Text>
        )}
        <div className='mt-4'>
          <Button icon={Link2Off} onClick={() => void connectionStore.disconnect()}>
            Disconnect
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
});
