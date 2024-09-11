import styled from 'styled-components';
import { ArrowLeftRight } from 'lucide-react';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { getBalanceView } from '@penumbra-zone/getters/balances-response';
import { fromValueView } from '@penumbra-zone/types/amount';
import { TextInput } from '../TextInput';
import { FormField } from '../FormField';
import { WalletBalance } from '../WalletBalance';
import { Button } from '../Button';
import { AssetSelector, AssetSelectorValue } from '../AssetSelector';
import { isBalancesResponse } from '../AssetSelector/shared/helpers.ts';
import { ActionType } from '../utils/ActionType.ts';

const AssetsRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing(1)};
  align-items: flex-start;
`;

const AssetColumn = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(1)};
`;

// Extends the height of the text input to match the height of the asset selectors
const HeightExtender = styled.div`
  width: 0;
  height: ${props => props.theme.spacing(12)};
`;

export interface SwapInputProps {
  label: string;
  placeholder?: string;

  /** Numerical value of the corresponding balance */
  value?: string;
  onValueChange?: (value: string) => void;

  /** The `Metadata` or `BalancesResponse`, from which the swap should be initiated */
  from?: AssetSelectorValue;
  onFromChange?: (value?: AssetSelectorValue) => void;

  /** The `Metadata` or `BalancesResponse`, to which the swap should be made */
  to?: AssetSelectorValue;
  onToChange?: (value?: AssetSelectorValue) => void;

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

/**
 * An input field for swapping assets. It allows the user to select the "from" and "to" assets,
 * input the amount to swap, and see the balances of the selected assets.
 */
export const SwapInput = ({
  assets,
  balances,
  label,
  placeholder,
  from,
  onFromChange,
  to,
  onToChange,
  value,
  onValueChange,
  actionType = 'default',
  disabled,
  dialogTitle,
}: SwapInputProps) => {
  const onFromMax = () => {
    if (!isBalancesResponse(from)) {
      return;
    }

    const maxValue = fromValueView(getBalanceView(from));
    onValueChange?.(maxValue.toString());
  };

  const onSwap = () => {
    onFromChange?.(to);
    onToChange?.(from);
  };

  return (
    <FormField label={label}>
      <TextInput
        min={0}
        type='number'
        value={value}
        disabled={disabled}
        actionType={actionType}
        placeholder={placeholder}
        onChange={onValueChange}
        endAdornment={<HeightExtender />}
      />

      <AssetsRow>
        <AssetColumn>
          <AssetSelector
            value={from}
            assets={assets}
            balances={balances}
            actionType={actionType}
            disabled={disabled}
            dialogTitle={dialogTitle}
            onChange={onFromChange}
          />
          {isBalancesResponse(from) && (
            <WalletBalance
              balance={from}
              actionType={actionType}
              disabled={disabled}
              onClick={onFromMax}
            />
          )}
        </AssetColumn>

        <Button
          priority='primary'
          iconOnly
          icon={ArrowLeftRight}
          disabled={disabled}
          actionType={actionType}
          onClick={onSwap}
        >
          Swap
        </Button>

        <AssetColumn>
          <AssetSelector
            value={to}
            assets={assets}
            balances={balances}
            actionType={actionType}
            disabled={disabled}
            dialogTitle={dialogTitle}
            onChange={onToChange}
          />
          {isBalancesResponse(to) && <WalletBalance balance={to} actionType={actionType} />}
        </AssetColumn>
      </AssetsRow>
    </FormField>
  );
};
