import { observer } from 'mobx-react-lite';
import { Card } from '@penumbra-zone/ui/Card';
import { AccountSelector } from '@penumbra-zone/ui/AccountSelector';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Wallet2 } from 'lucide-react';
import { useStakingStore } from '@/shared/stores/store-context';
import { useIsConnected, useConnectWallet } from '@/shared/hooks/use-connection';
import { StakingInfoDialog } from '../staking-info-dialog';
import { StakingStat } from './staking-stat';

export interface StakingAssetsCardProps {
  title?: string;
  showInfoButton?: boolean;
}

export const StakingAssetsCard = observer(
  ({ title = 'Your Staking Assets', showInfoButton = true }: StakingAssetsCardProps) => {
    const stakingStore = useStakingStore();
    const isConnected = useIsConnected();
    const { connectWallet } = useConnectWallet();

    // Use InfoDialog as endContent if showInfoButton is true
    const finalEndContent = showInfoButton ? <StakingInfoDialog /> : undefined;

    // If wallet is not connected, show connect wallet message
    if (!isConnected) {
      return (
        <Card title={title} endContent={finalEndContent}>
          <div className='flex flex-col items-center justify-center gap-4'>
            <div className='size-8 text-text-secondary'>
              <Wallet2 className='size-full' />
            </div>
            <Text color='text.secondary' small>
              Connect wallet to see your staking assets
            </Text>
            <div className='w-fit'>
              <Button actionType='default' density='compact' onClick={() => void connectWallet()}>
                Connect wallet
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card title={title} endContent={finalEndContent}>
        <div className='flex flex-col gap-3'>
          {/* Account Selector */}
          <AccountSelector
            value={stakingStore.currentAccount}
            onChange={stakingStore.setCurrentAccount}
            getDisplayValue={index => (index === 0 ? 'Main Account' : `Sub-Account #${index}`)}
          />

          {/* Stats Row - improved spacing */}
          <div className='grid grid-cols-3 gap-3'>
            <div className='flex flex-col items-center text-center'>
              <StakingStat label='Available to Delegate' value={stakingStore.availableToDelegate} />
            </div>

            <div className='flex flex-col items-center text-center'>
              <StakingStat
                label='Unbonding Amount'
                value={stakingStore.unbondingAmount}
                helpText='Total amount of UM you will receive, assuming no slashing, when you claim your unbonding tokens that are currently still in their unbonding period.'
              />
            </div>

            <div className='flex flex-col items-center text-center'>
              <StakingStat
                label='Claimable Amount'
                value={stakingStore.claimableAmount}
                helpText='Total amount of UM you will receive, assuming no slashing, when you claim your unbonding tokens that are currently eligible for claiming.'
              >
                {stakingStore.hasClaimableTokens && (
                  <Button
                    actionType='accent'
                    density='compact'
                    onClick={() => void stakingStore.claim()}
                    disabled={stakingStore.loading}
                  >
                    Claim
                  </Button>
                )}
              </StakingStat>
            </div>
          </div>
        </div>
      </Card>
    );
  },
);
