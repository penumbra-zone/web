import { TextInput } from '../TextInput';
import { FormField } from '../FormField';
import { WalletBalance } from '../WalletBalance';
import { AssetSelector, AssetSelectorValue } from '../AssetSelector';
import { isBalancesResponse } from '../AssetSelector/shared/helpers.ts';
import { ActionType } from '../utils/ActionType.ts';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { getBalanceView } from '@penumbra-zone/getters/balances-response';
import { fromValueView } from '@penumbra-zone/types/amount';
import { Density } from '../Density';

export interface ValueInputProps {
  label: string;
  placeholder?: string;

  /** Numerical value of the corresponding balance */
  value?: string;
  onValueChange?: (value: string) => void;

  /** Selected `Metadata` or `BalancesResponse` */
  selection?: AssetSelectorValue;
  onSelectionChange?: (value?: AssetSelectorValue) => void;

  /**
   * An array of `Metadata` – protobuf message types describing the asset:
   * its name, symbol, id, icons, and more
   */
  assets?: Metadata[];
  /**
   * An array of `BalancesResponse` – protobuf message types describing the balance of an asset:
   * the account containing the asset, the value of this asset and its description (has `Metadata` inside it)
   */
  balances?: BalancesResponse[];
  dialogTitle?: string;

  actionType?: ActionType;
  disabled?: boolean;
}

export const ValueInput = ({
  assets,
  balances,
  label,
  placeholder,
  selection,
  onSelectionChange,
  value,
  onValueChange,
  actionType = 'default',
  disabled,
  dialogTitle,
}: ValueInputProps) => {
  const onMax = () => {
    if (!isBalancesResponse(selection)) {
      return;
    }

    const maxValue = fromValueView(getBalanceView(selection));
    onValueChange?.(maxValue.toString());
  };

  return (
    <FormField
      label={label}
      helperText={
        isBalancesResponse(selection) && (
          <WalletBalance
            balance={selection}
            actionType={actionType}
            disabled={disabled}
            onClick={onMax}
          />
        )
      }
    >
      <TextInput
        actionType={actionType}
        disabled={disabled}
        type='number'
        min={0}
        placeholder={placeholder}
        value={value}
        onChange={onValueChange}
        endAdornment={
          <Density compact>
            <AssetSelector
              value={selection}
              assets={assets}
              balances={balances}
              actionType={actionType}
              disabled={disabled}
              dialogTitle={dialogTitle}
              onChange={onSelectionChange}
            />
          </Density>
        }
      />
    </FormField>
  );
};
