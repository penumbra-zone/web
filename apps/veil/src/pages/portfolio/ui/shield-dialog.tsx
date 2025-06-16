import { createPortal } from 'react-dom';
import { ReactNode } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

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
    <div className='fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[32px]'>
      <Image
        src='/assets/shield-backdrop.svg'
        alt='Shield backdrop'
        width={1600}
        height={1080}
        className='absolute inset-0 h-full w-full object-cover opacity-15'
        onClick={onClose}
      />
      <div className='relative mx-4 w-full max-w-2xl rounded-[20px] border border-[rgba(250,250,250,0.02)] p-6 backdrop-blur-[32px]'>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 z-10 p-2 text-white hover:text-gray-300'
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
