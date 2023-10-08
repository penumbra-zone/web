import React from 'react';
import { Input, InputProps } from 'ui';
import { Validation } from '../../../types/utility';
import { cn } from 'ui/lib/utils';
import { useValidationResult } from '../../../hooks';
import { FilledImage } from '../../../shared';
import { formatNumber } from '../../../utils';
import { Asset } from 'penumbra-constants';
import { SwapAssetInfo } from '../../../state/swap';
import dynamic from 'next/dynamic';
const SelectTokenModal = dynamic(() => import('../../../shared/select-token-modal'), {
  ssr: false,
});

interface SwapInputProps extends InputProps {
  asset: SwapAssetInfo & { price: number };
  placeholder: string;
  className?: string;
  setAsset: (asset: Asset) => void;
  validations?: Validation[];
}

export default function SwapInput({
  placeholder,
  asset,
  className,
  validations,
  setAsset,
  ...props
}: SwapInputProps) {
  const validationResult = useValidationResult(asset.amount, validations);

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
          value={asset.amount}
          {...props}
        />
        <SelectTokenModal asset={asset.asset} setAsset={setAsset} />
      </div>
      <div className='flex items-center justify-between'>
        <p className='text-base font-bold text-muted-foreground break-all'>
          ${formatNumber(Number(asset.amount) * asset.price)}
        </p>
        {(asset.balance === 0 || asset.balance) && (
          <div className='flex items-start gap-1'>
            <FilledImage src='/wallet.svg' alt='Wallet' className='h-5 w-5' />
            <p className='font-bold text-muted-foreground'>{formatNumber(asset.balance)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
