import { Input, InputProps } from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { displayAmount, fromBaseUnitAmount } from '@penumbra-zone/types';
import SelectTokenModal from './select-token-modal';
import { Validation, validationResult } from './validation-result';
import { AccountBalance } from '../../fetchers/balances';
import { Selection } from '../../state/send';

interface InputTokenProps extends InputProps {
  account: string;
  label: string;
  selection: Selection | undefined;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  value: string;
  setSelection: (selection: Selection) => void;
  validations?: Validation[];
  balances: AccountBalance[];
  tempPrice: number;
}

export default function InputToken({
  label,
  placeholder,
  selection,
  className,
  validations,
  value,
  inputClassName,
  setSelection,
  balances,
  tempPrice,
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
        <p className='text-sm font-bold md:text-base'>{label}</p>
        {vResult ? (
          <div className={cn('italic text-[12px] md:text-[15px]', 'text-red-400')}>
            {vResult.issue}
          </div>
        ) : null}
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
        <SelectTokenModal selection={selection} setSelection={setSelection} balances={balances} />
      </div>

      <div className='mt-[6px] flex items-center justify-between gap-2'>
        <p
          className={cn(
            'break-all md:test-[12px] xl:text-base font-bold text-light-brown',
            value && 'text-muted-foreground',
          )}
        >
          ${displayAmount(Number(value) * tempPrice)}
        </p>
        <div className='flex items-start gap-1'>
          <img src='/wallet.svg' alt='Wallet' className='h-5 w-5' />
          <p className='font-bold text-muted-foreground'>
            {selection?.asset
              ? fromBaseUnitAmount(
                  selection.asset.amount,
                  selection.asset.denom.exponent,
                ).toFormat()
              : '0'}
          </p>
        </div>
      </div>
    </div>
  );
}
