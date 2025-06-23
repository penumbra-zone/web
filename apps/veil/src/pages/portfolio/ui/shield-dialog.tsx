import { createPortal } from 'react-dom';
import { ReactNode } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui';

interface ShieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function ShieldDialog({ isOpen, onClose, children }: ShieldDialogProps) {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className='fixed inset-0 flex items-center justify-center backdrop-blur-md'>
      <Image
        priority
        src='/assets/shield-backdrop.svg'
        alt='Shield backdrop'
        width={1600}
        height={1080}
        className='absolute inset-0 h-full w-full object-cover opacity-40'
        onClick={onClose}
      />
      <div className='relative min-h-[411px] w-full bg-accent-radial-background max-w-2xl rounded-xl p-6 backdrop-blur-lg'>
        <div className='flex justify-between items-center'>
          <Text color='text.primary' xxl>
            Shield
          </Text>
          <Button
            onClick={onClose}
            actionType='default'
            priority='secondary'
            icon={X}
            density='compact'
            iconOnly
          >
            <X size={24} />
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
