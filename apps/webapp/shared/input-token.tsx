'use client';

import dynamic from 'next/dynamic';
import { Input, InputProps } from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useValidationResult } from '../hooks';
import { Validation } from '../types/utility';
import { FilledImage } from './filled-image';
import { Asset, AssetId, displayAmount } from '@penumbra-zone/types';

const SelectTokenModal = dynamic(() => import('./select-token-modal'), {
  ssr: false,
});

interface InputTokenProps extends InputProps {
  label: string;
  asset: Asset & { price: number };
  assetBalance: number;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  value: string;
  setAsset: (asset: AssetId) => void;
  validations?: Validation[];
}

export default function InputToken({
  label,
  placeholder,
  asset,
  assetBalance,
  className,
  validations,
  value,
  inputClassName,
  setAsset,
  ...props
}: InputTokenProps) {
  const validationResult = useValidationResult(value, validations);

  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-5 rounded-lg border flex flex-col',
        validationResult?.type === 'error' && 'border-red-400',
        validationResult?.type === 'warn' && 'border-yellow-300',
        className,
      )}
    >
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2 self-start'>
          <p className='text-base font-bold'>{label}</p>
          {validationResult ? (
            <div className={cn('italic', 'text-red-400')}>{validationResult.issue}</div>
          ) : null}
        </div>
        <div className='flex items-start gap-1'>
          <FilledImage src='/wallet.svg' alt='Wallet' className='h-5 w-5' />
          <p className='font-bold text-muted-foreground'>{displayAmount(assetBalance)}</p>
        </div>
      </div>
      <div className='flex items-center justify-between gap-4'>
        <Input
          variant='transparent'
          placeholder={placeholder}
          type='number'
          className={cn('h-10 w-[calc(100%-160px)] text-3xl font-bold leading-10', inputClassName)}
          value={value}
          {...props}
        />
        <SelectTokenModal asset={asset} setAsset={setAsset} />
      </div>
      <p
        className={cn(
          'break-all text-base font-bold text-light-brown',
          value && 'text-muted-foreground',
        )}
      >
        ${displayAmount(Number(value) * asset.price)}
      </p>
    </div>
  );
}
