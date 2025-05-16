import { useState } from 'react';
import { Button, Dialog, Text } from '@penumbra-zone/ui';
import { ShieldQuestion, Coins, KeySquare, Lock } from 'lucide-react';

export interface InfoDialogProps {
  className?: string;
}

export const InfoDialog = ({ className = '' }: InfoDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    {
      icon: <Coins size={20} className="text-amber-500" />,
      title: 'Asset Balances',
      content: 'Your balances are shielded, and are known only to you. They are not visible on chain. Each Penumbra wallet controls many numbered accounts, each with its own balance. Account information is never revealed on-chain.',
    },
    {
      icon: <KeySquare size={20} className="text-amber-500" />,
      title: 'Transaction History',
      content: 'Your wallet scans shielded chain data locally and indexes all relevant transactions it detects, both incoming and outgoing.',
    },
    {
      icon: <Lock size={20} className="text-amber-500" />,
      title: 'Shielded Transactions',
      content: 'Penumbra transactions are shielded and don\'t reveal any information about the sender, receiver, or amount. Use the toggle to see what information is revealed on-chain.',
    },
  ];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Trigger asChild>
          <Button
            icon={ShieldQuestion} 
            iconOnly="adornment"
            actionType="default"  
            priority="secondary"
            density="compact"
            onClick={() => setIsOpen(true)}
          >
            Information
          </Button>
        </Dialog.Trigger>
        <Dialog.Content 
          title="Shielded Portfolio"
          headerChildren={null}
          buttons={null}
          zIndex={1000}
        >
          <div className="flex flex-col gap-5 pt-2 pb-4 px-1">
            {sections.map((section, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="mt-0.5">{section.icon}</div>
                <div className="flex flex-col">
                  <Text strong={true} color="text.primary">
                    {section.title}
                  </Text>
                  <div className="mb-0.5" />
                  <Text small={true} color="text.secondary">
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