import { Link2Off } from 'lucide-react';
import { Popover } from '@repo/ui/Popover';
import { Button } from '@repo/ui/Button';
import { Text } from '@repo/ui/Text';
import PenumbraShortIcon from './penumbra-short.svg';
import { penumbra } from '../../../prax.ts';

export const PraxPopover = () => {
  const disconnect = () => {
    void penumbra.disconnect().then(() => window.location.reload());
  };

  if (!penumbra.manifest) {
    return null;
  }

  return (
    <Popover>
      <Popover.Trigger>
        <Button icon={PenumbraShortIcon} iconOnly>Prax wallet</Button>
      </Popover.Trigger>
      <Popover.Content align='end' side='bottom'>
        <div className='flex flex-col gap-2'>
          <Text body>{penumbra.manifest['name']} v{penumbra.manifest['version']}</Text>
          <Text small>{penumbra.manifest['description']}</Text>
        </div>
        <div className='mt-4'>
          <Button icon={Link2Off} onClick={disconnect}>Disconnect</Button>
        </div>
      </Popover.Content>
    </Popover>
  )
}
