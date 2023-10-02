'use client';

import { Dispatch, SetStateAction } from 'react';
import { Input, InputProps } from 'ui';
import { cn } from 'ui/lib/utils';
import { Asset } from '../../app/send/types';
import { ResponsiveImage } from '../responsive-image';
import { SelectTokenModal } from './select-token-modal';

interface InputTokenProps extends InputProps {
  label: string;
  asset: Asset;
  placeholder: string;
  className?: string;
  setAsset: Dispatch<SetStateAction<Asset>>;
}

export const InputToken = ({
  label,
  placeholder,
  asset,
  className,
  setAsset,
  ...props
}: InputTokenProps) => {
  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-5 rounded-lg border flex flex-col gap-1',
        className,
      )}
    >
      <div className='flex justify-between items-center'>
        <p className='text-base font-bold'>{label}</p>
        <div className='flex items-start gap-1'>
          <ResponsiveImage src='/wallet.svg' alt='Wallet' className='w-5 h-5' />
          <p className='font-bold text-muted-foreground'>42.1</p>
        </div>
      </div>
      <div className='flex justify-between items-center gap-4'>
        <Input variant='transparent' placeholder={placeholder} {...props} />
        <SelectTokenModal asset={asset} setAsset={setAsset} />
      </div>
    </div>
  );
};
