'use client';

import { useMemo } from 'react';
import { Input, InputProps } from 'ui';
import { cn } from 'ui/lib/utils';
import { Asset } from '../../types/asset';
import { Validation } from '../../types/utillity';
import { formatNumber } from '../../utils';
import { FilledImage } from '../filled-image';
import { SelectTokenModal } from './select-token-modal';

interface InputTokenProps extends InputProps {
  label: string;
  asset: Asset;
  placeholder: string;
  className?: string;
  setAsset: (asset: Asset) => void;
  validations?: Validation[];
}

export const InputToken = ({
  label,
  placeholder,
  asset,
  className,
  validations,
  setAsset,
  ...props
}: InputTokenProps) => {
  const priorityResult = useMemo(() => {
    if (!validations) return;
    const results = validations.filter(v => v.checkFn(props.value as string));
    const error = results.find(v => v.type === 'error');
    return error ? error : results.find(v => v.type === 'warn');
  }, [validations, props.value]);

  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-5 rounded-lg border flex flex-col gap-1',
        priorityResult?.type === 'error' && 'border-red-400',
        priorityResult?.type === 'warn' && 'border-yellow-300',
        className,
      )}
    >
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2 self-start'>
          <p className='text-base font-bold'>{label}</p>
          {priorityResult ? (
            <div className={cn('italic', 'text-red-400')}>{priorityResult.error}</div>
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
          {...props}
        />
        <SelectTokenModal asset={asset} setAsset={setAsset} />
      </div>
    </div>
  );
};
