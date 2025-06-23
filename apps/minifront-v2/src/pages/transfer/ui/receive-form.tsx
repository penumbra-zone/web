import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTransferStore } from '@/shared/stores/store-context';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Toggle } from '@penumbra-zone/ui/Toggle';
import { AccountSelector } from '@penumbra-zone/ui/AccountSelector';
import { Popover } from '@penumbra-zone/ui/Popover';
import { Copy, Info } from 'lucide-react';
import { Density } from '@penumbra-zone/ui/Density';

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
    if (receiveState.ibcDepositEnabled) {
      return index === 0
        ? 'IBC Deposit Address for Main Account'
        : `IBC Deposit Address for Sub-Account# ${index}`;
    }
    return index === 0 ? 'Main Account' : `Sub-Account# ${index}`;
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2 rounded-md bg-other-tonal-fill5 p-3'>
        {/* Account Selector */}
        <div className='flex flex-col gap-2'>
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
            className={`rounded-sm border border-other-tonal-stroke p-2 font-mono text-sm break-all ${
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
            <Popover>
              <Popover.Trigger>
                <div className='flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-other-tonal-stroke transition-colors hover:bg-other-tonal-fill10'>
                  <Info size={10} className='text-text-secondary' />
                </div>
              </Popover.Trigger>
              <Popover.Content side='top' align='start'>
                <Text xs>
                  IBC transfers into Penumbra post the destination address in public on the source
                  chain. Use this randomized IBC deposit address to preserve privacy when
                  transferring funds into Penumbra.
                </Text>
              </Popover.Content>
            </Popover>
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
