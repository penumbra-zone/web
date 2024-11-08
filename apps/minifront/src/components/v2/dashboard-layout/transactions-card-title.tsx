import { Button } from '@penumbra-zone/ui-old/Button';
import { CharacterTransition } from '@penumbra-zone/ui-old/CharacterTransition';
import { Dialog } from '@penumbra-zone/ui-old/Dialog';
import { Text } from '@penumbra-zone/ui-old/Text';
import { Info } from 'lucide-react';
import { useId } from 'react';

export const TransactionsCardTitle = () => {
  const layoutId = useId();
  return (
    <div className='flex items-center gap-2'>
      <CharacterTransition>Transactions List</CharacterTransition>
      <Dialog>
        <Dialog.Trigger asChild>
          <Button icon={Info} iconOnly='adornment' motion={{ layoutId }}>
            Info
          </Button>
        </Dialog.Trigger>
        <Dialog.Content title='Transactions List' motion={{ layoutId }}>
          <Text>
            Your wallet scans shielded chain data locally and indexes all relevant transactions it
            detects, both incoming and outgoing.
          </Text>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
