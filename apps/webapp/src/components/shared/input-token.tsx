import { Input, InputProps } from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils';
import SelectTokenModal from './select-token-modal';
import { Validation } from './validation-result';
import { AccountBalance, AssetBalance } from '../../fetchers/balances';
import { Selection } from '../../state/types';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { InputBlock } from './input-block';

const getCurrentBalanceValueView = (assetBalance: AssetBalance | undefined): ValueView => {
  if (assetBalance?.metadata)
    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: { amount: assetBalance.amount, metadata: assetBalance.metadata },
      },
    });
  else if (assetBalance?.assetId)
    return new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: { amount: assetBalance.amount, assetId: assetBalance.assetId },
      },
    });
  else return new ValueView();
};

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
  const currentBalanceValueView = getCurrentBalanceValueView(selection?.asset);

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
        <div className='flex items-start gap-1'>
          <img src='./wallet.svg' alt='Wallet' className='size-5' />
          <ValueViewComponent view={currentBalanceValueView} />
        </div>
      </div>
    </InputBlock>
  );
}
