import { cn } from '@repo/ui/lib/utils';
import BalanceSelector from './selectors/balance-selector';
import { Validation } from './validation-result';
import { InputBlock } from './input-block';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { BalanceValueView } from '@repo/ui/components/ui/balance-value-view';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import { NumberInput } from './number-input';

interface InputTokenProps {
  label: string;
  selection: BalancesResponse | undefined;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  value: string;
  setSelection: (selection: BalancesResponse) => void;
  validations?: Validation[];
  balances: BalancesResponse[];
  onInputChange: (amount: string) => void;
  loading?: boolean;
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
  onInputChange,
  loading,
}: InputTokenProps) {
  const setInputToBalanceMax = () => {
    const match = balances.find(b => b.balanceView?.equals(selection?.balanceView));
    if (match?.balanceView) {
      const formattedAmt = getFormattedAmtFromValueView(match.balanceView);
      onInputChange(formattedAmt);
    }
  };

  return (
    <InputBlock label={label} value={value} validations={validations} className={className}>
      <div className='flex items-center justify-between gap-4'>
        <NumberInput
          variant='transparent'
          placeholder={placeholder}
          className={cn(
            'md:h-8 xl:h-10 md:w-[calc(100%-80px)] xl:w-[calc(100%-160px)] md:text-xl xl:text-3xl font-bold leading-10',
            inputClassName,
          )}
          value={value}
          onChange={e => onInputChange(e.target.value)}
        />
        <BalanceSelector
          value={selection}
          onChange={setSelection}
          balances={balances}
          loading={loading}
        />
      </div>

      <div className='mt-[6px] flex items-center justify-between gap-2'>
        <div className='flex items-start gap-1 truncate'>
          {selection?.balanceView && (
            <BalanceValueView valueView={selection.balanceView} onClick={setInputToBalanceMax} />
          )}
        </div>
      </div>
    </InputBlock>
  );
}
