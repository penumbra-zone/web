import { useEffect, useMemo, useState } from 'react';
import { Link2Off } from 'lucide-react';
import { Popover } from '@penumbra-zone/ui/Popover';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { penumbra } from '../../../penumbra.ts';
import { PenumbraManifest } from '@penumbra-zone/client';

const usePenumbraManifest = (): PenumbraManifest | undefined => {
  const [manifest, setManifest] = useState<PenumbraManifest>();

  useEffect(() => {
    setManifest(penumbra.manifest);
    penumbra.onConnectionStateChange(() => {
      setManifest(penumbra.manifest);
    });
  }, []);

  return manifest;
};

export const ProviderPopover = () => {
  const manifest = usePenumbraManifest();

  const icon = useMemo(() => {
    const icons = manifest?.icons;
    const blob = icons?.['32'] ?? icons?.['128'];
    const element = !blob ? null : (
      <img src={URL.createObjectURL(blob)} alt={manifest?.name} className='size-4' />
    );
    return () => element;
  }, [manifest]);

  const disconnect = () => {
    void penumbra.disconnect().then(() => window.location.reload());
  };

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
          <Button icon={Link2Off} onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
};
