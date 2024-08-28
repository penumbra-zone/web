import { useMemo } from 'react';
import { Link2Off } from 'lucide-react';
import { Popover } from '@repo/ui/Popover';
import { Button } from '@repo/ui/Button';
import { Text } from '@repo/ui/Text';
import { penumbra, usePraxManifest } from '../../../prax.ts';
import praxLogo from './prax.svg?url';

const getIconComponent = (blob?: Blob, name?: string) => {
  const Icon = () => {
    return <img src={blob ? URL.createObjectURL(blob) : praxLogo} alt={name} className='size-4' />;
  };
  Icon.displayName = name;
  return Icon;
};

export const PraxPopover = () => {
  const manifest = usePraxManifest();

  const icon = useMemo(() => {
    const icons: Record<string, Blob> = manifest?.icons ?? {};
    const blob = icons['32'] ?? icons['128'] ?? icons['48'] ?? icons['16'] ?? undefined;
    return getIconComponent(blob, manifest?.['name']);
  }, [manifest]);

  const disconnect = () => {
    void penumbra.disconnect().then(() => window.location.reload());
  };

  return (
    <Popover>
      <Popover.Trigger>
        <Button icon={icon} iconOnly>
          Prax wallet
        </Button>
      </Popover.Trigger>
      {manifest && (
        <Popover.Content align='end' side='bottom'>
          <div className='flex flex-col gap-2'>
            <Text body>
              {manifest['name']} v{manifest['version']}
            </Text>
            <Text small>{manifest['description']}</Text>
          </div>
          <div className='mt-4'>
            <Button icon={Link2Off} onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        </Popover.Content>
      )}
    </Popover>
  );
};
