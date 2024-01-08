import { Input, InputProps } from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { fromBaseUnitAmount, joinLoHiAmount } from '@penumbra-zone/types';
import SelectTokenModal from './select-token-modal';
import { Validation, validationResult } from './validation-result';
import { AccountBalance, AssetBalance } from '../../fetchers/balances';
import { Selection } from '../../state/types';
import { Fee } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';

const PENUMBRA_FEE_DENOMINATOR = 1000;

const getFeeAsString = (fee: Fee | undefined) => {
  if (!fee?.amount) return '';
  return `${(Number(joinLoHiAmount(fee.amount)) / PENUMBRA_FEE_DENOMINATOR).toString()} penumbra`;
};

const getCurrentBalance = (assetBalance: AssetBalance | undefined) =>
  assetBalance
    ? fromBaseUnitAmount(assetBalance.amount, assetBalance.denom.exponent).toFormat()
    : '0';

interface InputTokenProps extends InputProps {
  label: string;
  selection: Selection | undefined;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  value: string;
  setSelection: (selection: Selection) => void;
  validations?: Validation[];
  balances: AccountBalance[];
  fee: Fee | undefined;
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
  fee,
  ...props
}: InputTokenProps) {
  const vResult = validationResult(value, validations);

  const currentBalance = getCurrentBalance(selection?.asset);
  const feeAsString = getFeeAsString(fee);

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
        <div className='flex items-start gap-2'>
          {feeAsString && (
            <>
              <img src='/fuel.svg' alt='Gas fee' className='h-5 w-5' />
              <p className='font-bold text-muted-foreground'>{feeAsString}</p>
            </>
          )}
        </div>
        <div className='flex items-start gap-1'>
          <img src='./wallet.svg' alt='Wallet' className='size-5' />
          <p className='font-bold text-muted-foreground'>{currentBalance}</p>
        </div>
      </div>
    </div>
  );
}
