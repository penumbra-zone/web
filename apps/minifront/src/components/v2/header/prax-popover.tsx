import { Link2Off } from 'lucide-react';
import { Popover } from '@repo/ui/Popover';
import { Button } from '@repo/ui/Button';
import { Text } from '@repo/ui/Text';
import PraxIcon from './prax.svg';
import { penumbra, usePraxManifest } from '../../../prax.ts';

export const PraxPopover = () => {
  const manifest = usePraxManifest();

  const disconnect = () => {
    void penumbra.disconnect().then(() => window.location.reload());
  };

  return (
    <Popover>
      <Popover.Trigger>
        {/* TODO: use `manifest.icons` to render the icon of the used wallet */}
        <Button icon={PraxIcon} iconOnly>
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
