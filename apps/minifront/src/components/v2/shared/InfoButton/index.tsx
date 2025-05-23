import { ReactNode, useState } from 'react';
import { Button, Dialog, Text } from '@penumbra-zone/ui';
import { ShieldQuestion, Coins, Send, ShieldAlert } from 'lucide-react';

export interface InfoButtonProps {
  /**
   * Array of sections to display in the dialog.
   * Each section should have a title and content.
   */
  sections?: {
    /**
     * The title/header of this section
     */
    title: string;
    /**
     * The icon to display next to the title (as a Lucide icon component)
     */
    icon?: ReactNode;
    /**
     * The content text of this section
     */
    content: string;
  }[];
  /**
   * The title of the dialog
   */
  dialogTitle?: string;
  /**
   * Optional additional classNames for the container
   */
  className?: string;
}

// Default sections for the Shielded Portfolio info
const defaultSections = [
  {
    title: 'Asset Balances',
    icon: <Coins size={18} />,
    content:
      'Your balances are shielded, and are known only to you. They are not visible on chain. Each Penumbra wallet controls many numbered accounts, each with its own balance. Account information is never revealed on-chain.',
  },
  {
    title: 'Transaction History',
    icon: <Send size={18} />,
    content:
      'Your wallet scans shielded chain data locally and indexes all relevant transactions it detects, both incoming and outgoing.',
  },
  {
    title: 'Shielded Transactions',
    icon: <ShieldAlert size={18} />,
    content:
      "Penumbra transactions are shielded and don't reveal any information about the sender, receiver, or amount. Use the toggle to see what information is revealed on-chain.",
  },
];

/**
 * InfoButton displays a button with a shield icon that opens a dialog with
 * sections of information when clicked.
 */
export const InfoButton = ({
  sections = defaultSections,
  dialogTitle = 'Shielded Portfolio',
  className = '',
}: InfoButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`flex items-center ${className}`}>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Trigger asChild>
          <Button
            icon={ShieldQuestion}
            iconOnly='adornment'
            actionType='default'
            priority='secondary'
            density='compact'
          >
            Information
          </Button>
        </Dialog.Trigger>
        <Dialog.Content title={dialogTitle} headerChildren={null} buttons={null} zIndex={1000}>
          <div className='flex flex-col gap-5'>
            {sections.map((section, index) => (
              <div key={index} className='flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  {section.icon && <div className='text-primary'>{section.icon}</div>}
                  <Text color='text.primary' variant='strong'>
                    {section.title}
                  </Text>
                </div>
                <Text color='text.primary'>{section.content}</Text>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
