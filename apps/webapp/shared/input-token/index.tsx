'use client';

import { Input, InputProps } from 'ui';
import { cn } from 'ui/lib/utils';
import { Asset } from '../../types/asset';
import { Validation } from '../../types/utility';
import { formatNumber } from '../../utils';
import { FilledImage } from '../filled-image';
import { SelectTokenModal } from './select-token-modal';
import { useValidationResult } from '../../hooks';

interface InputTokenProps extends InputProps {
  label: string;
  asset: Asset;
  placeholder: string;
  className?: string;
  value: string;
  setAsset: (asset: Asset) => void;
  validations?: Validation[];
}

export const InputToken = ({
  label,
  placeholder,
  asset,
  className,
  validations,
  value,
  setAsset,
  ...props
}: InputTokenProps) => {
  const validationResult = useValidationResult(value, validations);

  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-5 rounded-lg border flex flex-col gap-1',
        validationResult?.type === 'error' && 'border-red-400',
        validationResult?.type === 'warn' && 'border-yellow-300',
        className,
      )}
    >
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2 self-start'>
          <p className='text-base font-bold'>{label}</p>
          {validationResult ? (
            <div className={cn('italic', 'text-red-400')}>{validationResult.issue}</div>
          ) : null}
        </div>
        <div className='flex items-start gap-1'>
          <FilledImage src='/wallet.svg' alt='Wallet' className='w-5 h-5' />
          <p className='font-bold text-muted-foreground'>{formatNumber(asset.balance)}</p>
        </div>
      </div>
      <div className='flex justify-between items-center gap-4'>
        <Input
          variant='transparent'
          placeholder={placeholder}
          type='number'
          className='w-auto'
          value={value}
          {...props}
        />
        <SelectTokenModal asset={asset} setAsset={setAsset} />
      </div>
    </div>
  );
};
