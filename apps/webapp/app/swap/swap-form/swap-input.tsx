import React from 'react';
import { Input, InputProps } from 'ui';
import { Asset } from '../../../types/asset';
import { Validation } from '../../../types/utility';
import { cn } from 'ui/lib/utils';
import { useValidationResult } from '../../../hooks';
import { FilledImage, SelectTokenModal } from '../../../shared';
import { formatNumber } from '../../../utils';

interface SwapInputProps extends InputProps {
  asset: Asset | undefined;
  placeholder: string;
  className?: string;
  value: string;
  showBalance?: boolean;
  setAsset: (asset: Asset) => void;
  validations: Validation[] | undefined;
}

export const SwapInput = ({
  placeholder,
  asset,
  className,
  validations,
  value,
  showBalance,
  setAsset,
  ...props
}: SwapInputProps) => {
  const validationResult = useValidationResult(value, validations);

  return (
    <div
      className={cn(
        'bg-background rounded-lg border flex flex-col px-4 pt-4 pb-[14px] gap-[2px]',
        validationResult?.type === 'error' && 'border-red-400',
        validationResult?.type === 'warn' && 'border-yellow-300',
        className,
      )}
    >
      <div className='flex items-center justify-between gap-4'>
        <Input
          variant='transparent'
          placeholder={placeholder}
          type='number'
          className='h-10 w-[calc(100%-160px)] text-3xl font-bold leading-10'
          value={value}
          {...props}
        />
        <SelectTokenModal asset={asset} setAsset={setAsset} />
      </div>
      <div className='flex items-center justify-between'>
        <p className='text-base font-bold text-muted-foreground'>
          ${formatNumber(asset?.usdcValue ?? 0)}
        </p>
        {showBalance && (
          <div className='flex items-start gap-1'>
            <FilledImage src='/wallet.svg' alt='Wallet' className='h-5 w-5' />
            <p className='font-bold text-muted-foreground'>{formatNumber(asset?.balance ?? 0)}</p>
          </div>
        )}
      </div>
    </div>
  );
};
