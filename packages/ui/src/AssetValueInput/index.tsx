import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TextInput } from '../TextInput';
import { AssetSelector, AssetSelectorValue } from '../AssetSelector';
import { Text } from '../Text';
import { WalletMinimal, Info } from 'lucide-react';
import { Density } from '../Density';
import { ValueViewComponent } from '../ValueView';

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
  /** Error states for different validation scenarios */
  errors?: {
    /** Whether the amount format is invalid */
    amountError?: boolean;
    /** Whether the decimal places exceed the allowed exponent */
    exponentError?: boolean;
    /** Whether the amount exceeds available balance */
    insufficientFunds?: boolean;
  };
  /** Custom error messages for each error type */
  errorMessages?: {
    /** Message to display when amount format is invalid */
    amountError?: string;
    /** Message to display when decimal places are invalid */
    exponentError?: string;
    /** Message to display when insufficient funds */
    insufficientFunds?: string;
  };
  /** Whether to show the balance display below the input */
  showBalance?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * A combined input component for entering both an amount and selecting an asset.
 * 
 * This component integrates a numeric input field with an asset selector, providing
 * a unified interface for amount and asset selection. It includes built-in validation
 * states, balance display, and error handling.
 * 
 * ## Features
 * 
 * - **Integrated Asset Selection**: Uses AssetSelector as an end adornment
 * - **Balance Display**: Shows user's current balance for selected asset
 * - **Error Handling**: Built-in support for amount, exponent, and insufficient funds errors
 * - **Accessibility**: Proper error states and visual feedback
 * - **Responsive**: Works with the density system for different layouts
 * 
 * ## Usage
 * 
 * ```tsx
 * const [amount, setAmount] = useState('');
 * const [selectedAsset, setSelectedAsset] = useState<BalancesResponse>();
 * const [errors, setErrors] = useState({});
 * 
 * <AssetValueInput
 *   amount={amount}
 *   onAmountChange={setAmount}
 *   selectedAsset={selectedAsset}
 *   onAssetChange={setSelectedAsset}
 *   balances={userBalances}
 *   assets={availableAssets}
 *   errors={errors}
 *   showBalance={true}
 * />
 * ```
 * 
 * @example
 * // Basic usage with error handling
 * <AssetValueInput
 *   amount="100"
 *   onAmountChange={handleAmountChange}
 *   selectedAsset={penumbraBalance}
 *   onAssetChange={handleAssetChange}
 *   balances={[penumbraBalance, osmoBalance]}
 *   errors={{ insufficientFunds: true }}
 *   errorMessages={{ insufficientFunds: "Not enough tokens" }}
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
  errors = {},
  errorMessages = {
    amountError: 'Invalid amount',
    exponentError: 'Invalid decimal length',
    insufficientFunds: 'Insufficient funds',
  },
  showBalance = true,
  disabled = false,
}: AssetValueInputProps) => {
  const hasError =
    (errors.amountError ?? false) ||
    (errors.exponentError ?? false) ||
    (errors.insufficientFunds ?? false);

  const handleAssetSelectorChange = (value: AssetSelectorValue) => {
    // AssetSelector can return Metadata or BalancesResponse
    if ('balanceView' in value) {
      onAssetChange(value);
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
              className={`rounded-sm bg-other-tonalFill5 px-2 py-1 ${errors.insufficientFunds ? 'text-destructive-light' : ''}`}
            >
              <WalletMinimal
                className={`size-4 ${errors.insufficientFunds ? 'text-destructive-light' : 'text-text-secondary'}`}
              />
            </div>
            <div className={errors.insufficientFunds ? '' : 'opacity-50'}>
              <ValueViewComponent
                valueView={selectedAsset.balanceView}
                context='table'
                showIcon={false}
                abbreviate={true}
                density='compact'
                priority={errors.insufficientFunds ? 'primary' : 'secondary'}
                textColor={errors.insufficientFunds ? 'destructive.light' : undefined}
              />
            </div>
          </div>

          {/* Insufficient funds error underneath balance */}
          {errors.insufficientFunds && (
            <Text small color='destructive.light'>
              <div className='flex items-center gap-1'>
                <Info className='size-3' />
                {errorMessages.insufficientFunds ?? 'Insufficient funds'}
              </div>
            </Text>
          )}
        </div>
      )}

      {/* Other Error Messages */}
      {errors.exponentError && (
        <Text small color='destructive.light'>
          <div className='flex items-center gap-1'>
            <Info className='size-3' />
            {errorMessages.exponentError ?? 'Invalid decimal length'}
          </div>
        </Text>
      )}

      {errors.amountError && !errors.insufficientFunds && !errors.exponentError && (
        <Text small color='destructive.light'>
          <div className='flex items-center gap-1'>
            <Info className='size-3' />
            {errorMessages.amountError ?? 'Invalid amount'}
          </div>
        </Text>
      )}
    </div>
  );
};
