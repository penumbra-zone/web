import { useState } from 'react';
import { Button } from '@penumbra-zone/ui/Button';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { ShieldQuestion, Shield, ShieldAlert, ShieldOff } from 'lucide-react';

export interface ShieldingInfoDialogProps {
  className?: string;
}

export const ShieldingInfoDialog = ({ className = '' }: ShieldingInfoDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    {
      icon: <Shield size={20} className='text-primary-light' />,
      title: 'Shield Assets',
      content:
        "Shielding moves your assets from transparent chains (like Ethereum, Cosmos Hub) into Penumbra's shielded pool, where they become private and can be used for private transactions, swaps, and staking.",
    },
    {
      icon: <ShieldOff size={20} className='text-unshield-light' />,
      title: 'Unshield Assets',
      content:
        "Unshielding moves your assets from Penumbra's shielded pool back to transparent chains. This makes your assets visible on the destination chain and allows you to use them in transparent DeFi protocols.",
    },
    {
      icon: <ShieldAlert size={20} className='text-text-primary' />,
      title: 'Privacy Note',
      content:
        'Shielded assets on Penumbra are completely private. Only you can see your balances and transaction history. When you unshield, the destination address and amount become visible on the target chain.',
    },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Trigger asChild>
          <Button
            icon={ShieldQuestion}
            iconOnly='adornment'
            actionType='default'
            priority='secondary'
            density='compact'
            onClick={() => setIsOpen(true)}
          >
            Information
          </Button>
        </Dialog.Trigger>
        <Dialog.Content title='Shielding Assets' headerChildren={null} buttons={null}>
          <div className='flex flex-col gap-5 px-1 pt-2 pb-4'>
            {sections.map((section, index) => (
              <div key={index} className='flex items-start gap-3'>
                <div className='mt-0.5'>{section.icon}</div>
                <div className='flex flex-col'>
                  <Text strong={true} color='text.primary'>
                    {section.title}
                  </Text>
                  <div className='mb-0.5' />
                  <Text small={true} color='text.secondary'>
                    {section.content}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
