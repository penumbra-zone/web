import { Input, InputProps } from '@penumbra-zone/ui/components/ui/input';
import { cn } from '@penumbra-zone/ui/lib/utils';
import SelectTokenModal from './select-token-modal';
import { Validation } from './validation-result';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { InputBlock } from './input-block';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { WalletIcon } from '@penumbra-zone/ui/components/ui/icons/wallet';

interface InputTokenProps extends InputProps {
  label: string;
  selection: BalancesResponse | undefined;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  value: string;
  setSelection: (selection: BalancesResponse) => void;
  validations?: Validation[];
  balances: BalancesResponse[];
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
  ...props
}: InputTokenProps) {
  return (
    <InputBlock label={label} value={value} validations={validations} className={className}>
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
        <div className='flex items-start gap-1 truncate'>
          <WalletIcon className='size-5' />
          <ValueViewComponent view={selection?.balanceView} showIcon={false} />
        </div>
      </div>
    </InputBlock>
  );
}
