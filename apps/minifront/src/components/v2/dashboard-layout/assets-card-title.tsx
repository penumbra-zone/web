import { Button } from '@repo/ui/Button';
import { Dialog } from '@repo/ui/Dialog';
import { Text } from '@repo/ui/Text';
import { Info } from 'lucide-react';

export const AssetsCardTitle = () => (
  <div className='flex items-center gap-2'>
    Asset Balances
    <Dialog>
      <Dialog.Trigger asChild>
        <Button icon={Info} iconOnly='adornment'>
          Info
        </Button>
      </Dialog.Trigger>
      <Dialog.Content title='Asset Balances'>
        <Text>
          Your balances are shielded, and are known only to you. They are not visible on chain. Each
          Penumbra wallet controls many numbered accounts, each with its own balance. Account
          information is never revealed on-chain.
        </Text>
      </Dialog.Content>
    </Dialog>
  </div>
);
