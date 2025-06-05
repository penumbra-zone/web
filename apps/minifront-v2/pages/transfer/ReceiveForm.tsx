import { observer } from 'mobx-react-lite';
import { useTransferStore } from '@shared/stores/store-context';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Toggle } from '@penumbra-zone/ui/Toggle';
import { AccountSelector } from '@penumbra-zone/ui';
import { Copy } from 'lucide-react';
import { Density } from '@penumbra-zone/ui';

export const ReceiveForm = observer(() => {
  const transferStore = useTransferStore();
  const { receiveState } = transferStore;

  const handleAccountChange = (index: number) => {
    transferStore.setSelectedAccountIndex(index);
  };

  const handleCopyAddress = () => {
    transferStore.copyAddress();
  };

  const handleToggleIbcDeposit = (selected: boolean) => {
    // Only call the store method if the new state is different
    if (selected !== receiveState.ibcDepositEnabled) {
      transferStore.toggleIbcDeposit();
    }
  };

  // Get the display name for the account
  const getAccountDisplayName = (index: number) => {
    return index === 0 ? 'Main Account' : `Sub-Account# ${index}`;
  };

  return (
    <div className='flex flex-col gap-6 '>
      <div className='flex flex-col gap-2 p-3 bg-other-tonalFill5 rounded-md'>
        {/* Account Selector */}
        <div className='flex flex-col gap-2 '>
          <Text strong>Account</Text>
          <Density compact>
            <AccountSelector
              value={receiveState.selectedAccountIndex}
              onChange={handleAccountChange}
              canGoPrevious={receiveState.selectedAccountIndex > 0}
              canGoNext={true}
              getDisplayValue={getAccountDisplayName}
            />
          </Density>
        </div>

        {/* Address Display */}
        <div className='flex flex-col gap-2'>
          <div
            className={`font-mono text-sm break-all p-2 border border-other-tonalStroke rounded-sm ${
              receiveState.ibcDepositEnabled ? 'text-primary-light' : 'text-text-secondary'
            }`}
          >
            {receiveState.accountAddress || 'Loading...'}
          </div>
        </div>

        {/* IBC Deposit Toggle */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Text color='text.secondary' xs>
              IBC Deposit
            </Text>
            <div className='w-4 h-4 rounded-full border border-other-tonalStroke flex items-center justify-center'>
              <Text xxs color='text.secondary'>
                i
              </Text>
            </div>
          </div>
          <Toggle
            label='IBC Deposit'
            value={receiveState.ibcDepositEnabled}
            onChange={handleToggleIbcDeposit}
          />
        </div>
      </div>

      {/* Copy Address Button */}
      <div className='mt-2'>
        <Button
          onClick={handleCopyAddress}
          icon={Copy}
          actionType='default'
          disabled={!receiveState.accountAddress}
        >
          Copy Address
        </Button>
      </div>
    </div>
  );
});
