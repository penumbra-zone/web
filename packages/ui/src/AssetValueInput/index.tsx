import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TextInput } from '../TextInput';
import { AssetSelector, AssetSelectorValue } from '../AssetSelector';
import { Text } from '../Text';
import { WalletMinimal, Info } from 'lucide-react';
import { Density } from '../Density';
import { ValueViewComponent } from '../ValueView';
import { pnum } from '@penumbra-zone/types/pnum';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

/**
 * Props for the AssetValueInput component.
 */
export interface AssetValueInputProps {
  /** The amount value entered by the user */
  amount: string;
  /** Callback fired when the amount value changes */
  onAmountChange: (amount: string) => void;
  /** The currently selected asset (BalancesResponse) */
  selectedAsset?: BalancesResponse;
  /** Callback fired when the asset selection changes */
  onAssetChange: (asset: BalancesResponse) => void;
  /** Available balance responses for asset selection */
  balances?: BalancesResponse[];
  /** Available assets metadata for selection when no balance is available */
  assets?: Metadata[];
  /** Placeholder text for the amount input field */
  amountPlaceholder?: string;
  /** Title for the asset selector dialog */
  assetDialogTitle?: string;
  /** Custom error message to display. If provided, will trigger error styling and show this message. */
  error?: string;
  /** Whether to show the balance display below the input */
  showBalance?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
}

// Internal validation logic
const validateAmount = (amount: string, selectedAsset?: BalancesResponse) => {
  if (!amount.trim()) {
    return null;
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount < 0) {
    return 'Please enter a valid amount';
  }

  // Check decimal places against asset exponent
  if (selectedAsset?.balanceView) {
    const metadata = getMetadata.optional(selectedAsset.balanceView);
    const maxDecimals = getDisplayDenomExponent.optional(metadata) ?? 6;
    const decimalPlaces = amount.includes('.') ? (amount.split('.')[1]?.length ?? 0) : 0;

    if (decimalPlaces > maxDecimals) {
      return `Too many decimal places (max ${maxDecimals})`;
    }

    // Check balance
    const balance = pnum(selectedAsset.balanceView).toNumber();
    if (numericAmount > balance) {
      return 'Insufficient funds';
    }
  }

  return null;
};

/**
 * A combined input component for entering both an amount and selecting an asset.
 *
 * This component integrates a numeric input field with an asset selector, providing
 * a unified interface for amount and asset selection. It includes built-in validation
 * for amount format, decimal places, and insufficient funds.
 *
 * ## Features
 *
 * - **Integrated Asset Selection**: Uses AssetSelector as an end adornment
 * - **Balance Display**: Shows user's current balance for selected asset
 * - **Built-in Validation**: Automatic validation for amount format, decimals, and balance
 * - **Custom Errors**: Support for custom error messages via the error prop
 * - **Accessibility**: Proper error states and visual feedback
 * - **Responsive**: Works with the density system for different layouts
 *
 * ## Usage
 *
 * ```tsx
 * const [amount, setAmount] = useState('');
 * const [selectedAsset, setSelectedAsset] = useState<BalancesResponse>();
 *
 * <AssetValueInput
 *   amount={amount}
 *   onAmountChange={setAmount}
 *   selectedAsset={selectedAsset}
 *   onAssetChange={setSelectedAsset}
 *   balances={userBalances}
 *   assets={availableAssets}
 *   showBalance={true}
 * />
 * ```
 *
 * @example
 * // With custom error
 * <AssetValueInput
 *   amount="100"
 *   onAmountChange={handleAmountChange}
 *   selectedAsset={penumbraBalance}
 *   onAssetChange={handleAssetChange}
 *   balances={[penumbraBalance, osmoBalance]}
 *   error="Custom validation error"
 * />
 */
export const AssetValueInput = ({
  amount,
  onAmountChange,
  selectedAsset,
  onAssetChange,
  balances = [],
  assets = [],
  amountPlaceholder = 'Amount to send...',
  assetDialogTitle = 'Select Asset',
  error,
  showBalance = true,
  disabled = false,
}: AssetValueInputProps) => {
  // Calculate internal validation error
  const internalError = validateAmount(amount, selectedAsset);

  // Use custom error if provided, otherwise use internal validation
  const displayError = error ?? internalError;
  const hasError = !!displayError;

  // Check if error is specifically insufficient funds for special styling
  const isInsufficientFunds = displayError?.toLowerCase().includes('insufficient');

  const handleAssetSelectorChange = (value: AssetSelectorValue) => {
    // AssetSelector can return Metadata or BalancesResponse
    if ('balanceView' in value) {
      onAssetChange(value);
    }
  };

  // When user clicks the balance row, fill the input with the full balance
  const handleBalanceClick = () => {
    if (disabled) {
      return;
    }
    if (selectedAsset?.balanceView) {
      const max = pnum(selectedAsset.balanceView).toNumber().toString();
      onAmountChange(max);
    }
  };

  // Determine the action type based on error state
  const actionType = hasError ? 'destructive' : 'default';

  return (
    <div className='flex flex-col gap-1'>
      {/* TextInput with integrated AssetSelector */}
      <TextInput
        value={amount}
        onChange={onAmountChange}
        placeholder={amountPlaceholder}
        type='number'
        disabled={disabled}
        actionType={actionType}
        endAdornment={
          <Density slim>
            <AssetSelector
              value={selectedAsset}
              onChange={handleAssetSelectorChange}
              balances={balances}
              assets={assets}
              dialogTitle={assetDialogTitle}
              disabled={disabled}
            />
          </Density>
        }
      />

      {/* Balance Display using proper ValueViewComponent */}
      {showBalance && selectedAsset?.balanceView && (
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <div
              className={`rounded-sm bg-other-tonal-fill5 px-2 py-1 ${isInsufficientFunds ? 'text-destructive-light' : ''}`}
            >
              <WalletMinimal
                className={`size-4 ${isInsufficientFunds ? 'text-destructive-light' : 'text-text-secondary'}`}
              />
            </div>
            <div
              role='button'
              onClick={handleBalanceClick}
              className={`${isInsufficientFunds ? '' : 'opacity-50'} cursor-pointer`}
            >
              <ValueViewComponent
                valueView={selectedAsset.balanceView}
                context='table'
                showIcon={false}
                abbreviate={true}
                density='compact'
                priority={isInsufficientFunds ? 'primary' : 'secondary'}
                textColor={isInsufficientFunds ? 'destructive.light' : undefined}
              />
            </div>
          </div>

          {/* Display error message below balance if it's insufficient funds */}
          {isInsufficientFunds && (
            <Text small color='destructive.light'>
              <div className='flex items-center gap-1'>
                <Info className='size-3' />
                {displayError}
              </div>
            </Text>
          )}
        </div>
      )}

      {/* Display error message for non-insufficient-funds errors */}
      {hasError && !isInsufficientFunds && (
        <Text small color='destructive.light'>
          <div className='flex items-center gap-1'>
            <Info className='size-3' />
            {displayError}
          </div>
        </Text>
      )}
    </div>
  );
};
