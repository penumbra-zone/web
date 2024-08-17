import { Button } from '@repo/ui/Button';
import { CharacterTransition } from '@repo/ui/CharacterTransition';
import { Dialog } from '@repo/ui/Dialog';
import { Text } from '@repo/ui/Text';
import { Info } from 'lucide-react';
import { useId } from 'react';

export const AssetsCardTitle = () => {
  const layoutId = useId();
  return (
    <div className='flex items-center gap-2'>
      <CharacterTransition>Asset Balances</CharacterTransition>
      <Dialog>
        <Dialog.Trigger asChild>
          <Button icon={Info} iconOnly='adornment' motion={{ layoutId }}>
            Info
          </Button>
        </Dialog.Trigger>
        <Dialog.Content title='Asset Balances' motion={{ layoutId }}>
          <Text>
            Your balances are shielded, and are known only to you. They are not visible on chain.
            Each Penumbra wallet controls many numbered accounts, each with its own balance. Account
            information is never revealed on-chain.
          </Text>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
