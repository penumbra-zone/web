import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TextInput } from '../TextInput';
import { AssetSelector, AssetSelectorValue } from '../AssetSelector';
import { Text } from '../Text';
import { AlertCircle, WalletMinimal, Info } from 'lucide-react';
import { Density } from '../Density';
import { ValueViewComponent } from '../ValueView';

export interface AssetValueInputProps {
  /** The amount value */
  amount: string;
  /** Callback when amount changes */
  onAmountChange: (amount: string) => void;
  /** The selected asset */
  selectedAsset?: BalancesResponse;
  /** Callback when asset selection changes */
  onAssetChange: (asset: BalancesResponse) => void;
  /** Available balance responses for selection */
  balances?: BalancesResponse[];
  /** Available assets metadata */
  assets?: Metadata[];
  /** Amount input placeholder */
  amountPlaceholder?: string;
  /** Asset selector dialog title */
  assetDialogTitle?: string;
  /** Error states */
  errors?: {
    amountError?: boolean;
    exponentError?: boolean;
    insufficientFunds?: boolean;
  };
  /** Error messages */
  errorMessages?: {
    amountError?: string;
    exponentError?: string;
    insufficientFunds?: string;
  };
  /** Whether to show balance */
  showBalance?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

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
  const hasError = errors.amountError || errors.exponentError || errors.insufficientFunds;

  const handleAssetSelectorChange = (value: AssetSelectorValue) => {
    // AssetSelector can return Metadata or BalancesResponse
    if ('balanceView' in value) {
      onAssetChange(value as BalancesResponse);
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
            <div className={`bg-other-tonalFill5 px-2 py-1 rounded-sm ${errors.insufficientFunds ? 'text-destructive-light' : ''}`}>
              <WalletMinimal className={`w-4 h-4 ${errors.insufficientFunds ? 'text-destructive-light' : 'text-text-secondary'}`} />
            </div>
            <div className={errors.insufficientFunds ? '' : 'opacity-50'}>
              <ValueViewComponent
                valueView={selectedAsset.balanceView}
                context='table'
                showIcon={false}
                abbreviate={true}
                density='compact'
                textColor={errors.insufficientFunds ? 'destructive-light' : undefined}
              />
            </div>
          </div>
          
          {/* Insufficient funds error underneath balance */}
          {errors.insufficientFunds && (
            <Text small color='destructive.light'>
              <div className='flex items-center gap-1'>
                <Info className='w-3 h-3' />
                {errorMessages.insufficientFunds}
              </div>
            </Text>
          )}
        </div>
      )}

      {/* Other Error Messages */}
      {errors.exponentError && (
        <Text small color='destructive.light'>
          <div className='flex items-center gap-1'>
            <Info className='w-3 h-3' />
            {errorMessages.exponentError}
          </div>
        </Text>
      )}

      {errors.amountError && !errors.insufficientFunds && !errors.exponentError && (
        <Text small color='destructive.light'>
          <div className='flex items-center gap-1'>
            <Info className='w-3 h-3' />
            {errorMessages.amountError}
          </div>
        </Text>
      )}
    </div>
  );
};
