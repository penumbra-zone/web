import { Input, InputProps } from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { Asset, AssetId, displayAmount } from '@penumbra-zone/types';
import BigNumber from 'bignumber.js';
import SelectTokenModal from './select-token-modal.tsx';
import { Validation, validationResult } from './validation-result.ts';
import { AssetBalance } from '../../fetchers/balances.ts';

interface InputTokenProps extends InputProps {
  label: string;
  asset: Asset & { price: number };
  assetBalance: BigNumber; // Includes exponent formatting
  placeholder: string;
  className?: string;
  inputClassName?: string;
  value: string;
  setAsset: (asset: AssetId) => void;
  validations?: Validation[];
  balances: AssetBalance[];
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
  balances,
  ...props
}: InputTokenProps) {
  const vResult = validationResult(value, validations);

  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-5 rounded-lg border flex flex-col',
        vResult?.type === 'error' && 'border-red-400',
        vResult?.type === 'warn' && 'border-yellow-300',
        className,
      )}
    >
      <div className='mb-2 flex items-center justify-between gap-1 md:gap-2'>
        <p className='text-sm md:text-base font-bold'>{label}</p>
        {vResult ? <div className={cn('italic text-[12px] md:text-[15px]', 'text-red-400')}>{vResult.issue}</div> : null}
      </div>
      <div className='flex items-center justify-between gap-4'>
        <Input
          variant='transparent'
          placeholder={placeholder}
          type='number'
          className={cn(
            'md:h-8 xl:h-10 md:w-[calc(100%-80px)] xl:w-[calc(100%-160px)] md:text-xl  xl:text-3xl font-bold leading-10',
            inputClassName,
          )}
          value={value}
          {...props}
        />
        <SelectTokenModal asset={asset} setAsset={setAsset} balances={balances} />
      </div>

      <div className='flex justify-between items-center mt-[6px] gap-2'>
        <p
          className={cn(
            'break-all md:test-[12px] xl:text-base font-bold text-light-brown',
            value && 'text-muted-foreground',
          )}
        >
          ${displayAmount(Number(value) * asset.price)}
        </p>
        <div className='flex items-start gap-1'>
          <img src='/wallet.svg' alt='Wallet' className='h-5 w-5' />
          <p className='font-bold text-muted-foreground'>{assetBalance.toFormat()}</p>
        </div>
      </div>
    </div>
  );
}
