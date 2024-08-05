import { Button } from '@repo/ui/Button';
import { Dialog } from '@repo/ui/Dialog';
import { Text } from '@repo/ui/Text';
import { Info } from 'lucide-react';

export const TransactionsCardTitle = () => (
  <div className='flex items-center gap-2'>
    Transactions List
    <Dialog>
      <Dialog.Trigger asChild>
        <Button icon={Info} iconOnly='adornment'>
          Info
        </Button>
      </Dialog.Trigger>
      <Dialog.Content title='Transactions List'>
        <Text>
          Your wallet scans shielded chain data locally and indexes all relevant transactions it
          detects, both incoming and outgoing.
        </Text>
      </Dialog.Content>
    </Dialog>
  </div>
);
