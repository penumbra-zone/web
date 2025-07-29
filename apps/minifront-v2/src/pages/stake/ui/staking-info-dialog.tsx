import { useState } from 'react';
import { Button } from '@penumbra-zone/ui/Button';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { ShieldQuestion, Coins, MoonStar } from 'lucide-react';

export interface StakingInfoDialogProps {
  className?: string;
}

export const StakingInfoDialog = ({ className = '' }: StakingInfoDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    {
      icon: <Coins size={20} className='text-amber-500' />,
      title: 'Staking Assets',
      content:
        'This is description information. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.',
    },
    {
      icon: <MoonStar size={20} className='text-amber-500' />,
      title: 'Delegation Tokens',
      content:
        'This is description information. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi.',
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
        <Dialog.Content title='Shielded Staking' headerChildren={null}>
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
