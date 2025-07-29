import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Card } from '@penumbra-zone/ui/Card';
import { Info, CircleX } from 'lucide-react';
import { useStakingStore, useBalancesStore } from '@/shared/stores/store-context';
import { ValidatorRow } from '../validator-row';
import { AssetValueInput } from '@penumbra-zone/ui/AssetValueInput';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { useState, useEffect, useMemo } from 'react';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { getDisplay } from '@penumbra-zone/getters/metadata';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { getIdentityKeyFromValidatorInfo } from '@penumbra-zone/getters/validator-info';

export const DelegateDialog = observer(() => {
  const stakingStore = useStakingStore();
  const balancesStore = useBalancesStore();

  const isOpen = !!stakingStore.action;
  const action = stakingStore.action;
  const validator = stakingStore.actionValidator;
  const amount = stakingStore.amount;

  // Local state for selected asset
  const [selectedAsset, setSelectedAsset] = useState<BalancesResponse | undefined>(undefined);

  // Get validator identity key for filtering delegation tokens
  const identityKey = useMemo(() => {
    if (!validator) return '';
    const key = getIdentityKeyFromValidatorInfo.optional(validator);
    return key ? bech32mIdentityKey({ ik: key.ik }) : '';
  }, [validator]);

  // Get all UM balances from all accounts
  const allUmBalances = useMemo(() => {
    return balancesStore.balancesByAccount.flatMap(acc =>
      acc.balances.filter(balance => {
        const metadata = getMetadataFromBalancesResponse.optional?.(balance);
        return metadata?.symbol === 'UM';
      }),
    );
  }, [balancesStore.balancesByAccount]);

  // Get all delegation balances for this specific validator
  const allDelegationBalances = useMemo(() => {
    if (!identityKey) return [];

    return balancesStore.balancesByAccount.flatMap(acc =>
      acc.balances.filter(balance => {
        const metadata = getMetadataFromBalancesResponse.optional(balance);
        const display = getDisplay.optional(metadata);
        if (!display) return false;

        const match = assetPatterns.delegationToken.capture(display);
        return match?.idKey === identityKey;
      }),
    );
  }, [balancesStore.balancesByAccount, identityKey]);

  // Choose which balances to show based on action
  const balancesToShow = action === 'delegate' ? allUmBalances : allDelegationBalances;

  // Pre-select appropriate balance from current account if available
  const currentAccountInitial = useMemo(() => {
    const currentAccountBalances =
      balancesStore.balancesByAccount.find(acc => acc.account === stakingStore.currentAccount)
        ?.balances ?? [];

    if (action === 'delegate') {
      return currentAccountBalances.find(balance => {
        const metadata = getMetadataFromBalancesResponse.optional(balance);
        return metadata?.symbol === 'UM';
      });
    } else {
      return currentAccountBalances.find(balance => {
        const metadata = getMetadataFromBalancesResponse.optional(balance);
        const display = getDisplay.optional(metadata);
        if (!display) return false;

        const match = assetPatterns.delegationToken.capture(display);
        return match?.idKey === identityKey;
      });
    }
  }, [balancesStore.balancesByAccount, stakingStore.currentAccount, action, identityKey]);

  // Initialize selected asset when dialog opens
  useEffect(() => {
    if (isOpen && !selectedAsset) {
      const initialAsset = currentAccountInitial || balancesToShow[0];
      setSelectedAsset(initialAsset);
      stakingStore.setSelectedBalancesResponse(initialAsset);
    }
  }, [isOpen, currentAccountInitial, balancesToShow, selectedAsset, stakingStore]);

  // Reset selected asset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAsset(undefined);
      stakingStore.setSelectedBalancesResponse(undefined);
    }
  }, [isOpen, stakingStore]);

  // Check if validator has high voting power (>5%)
  const votingPower = validator ? stakingStore.getVotingPower(validator) : 0;
  const showCautionBanner = votingPower > 5;

  const handleSubmit = async () => {
    if (!action) return;

    try {
      if (action === 'delegate') {
        await stakingStore.delegate();
      } else {
        await stakingStore.undelegate();
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    }
  };

  const handleClose = () => {
    stakingStore.closeAction();
  };

  const handleAssetChange = (asset: BalancesResponse) => {
    setSelectedAsset(asset);
    stakingStore.setSelectedBalancesResponse(asset);
    // Reset amount when asset changes
    stakingStore.setAmount('');
  };

  const isFormValid = !!selectedAsset && amount && parseFloat(amount) > 0;
  const actionLabel = action === 'delegate' ? 'Delegate' : 'Undelegate';

  // Button text logic for different states
  const getButtonText = () => {
    if (stakingStore.loading) {
      return 'Review Prax';
    }
    return actionLabel;
  };

  if (!isOpen || !validator) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <Dialog.Content title={actionLabel}>
        <div className='flex flex-col gap-4'>
          {/* Caution Banner */}
          {showCautionBanner && action === 'delegate' && (
            <div className='flex items-center gap-3 rounded-sm bg-caution-light p-3'>
              <Info size={22} className='text-caution-dark mt-0.5 flex-shrink-0' />
              <Text small color='caution.dark'>
                The validator you're delegating to has more than 5% of the current voting power. To
                promote decentralization, it's recommended to choose a smaller validator.
              </Text>
            </div>
          )}
          {/* Error Message */}
          {stakingStore.error && (
            <div className='flex items-center gap-3 rounded-sm bg-destructive-light p-3'>
              <CircleX size={22} className='text-destructive-dark' />
              <Text small color='destructive.dark'>
                {stakingStore.error}
              </Text>
            </div>
          )}

          {/* Validator Info */}
          <Card.Stack>
            <Card.Section>
              <ValidatorRow validatorInfo={validator} compact />
              {/* Verification Notice */}
              <div className='flex items-start gap-2 mt-2'>
                <Info size={16} className='text-caution-light mt-0.5 flex-shrink-0' />
                <div className='flex flex-col gap-1'>
                  <Text detail color='caution.light'>
                    Please verify that the identity key above is the one you expect, rather than
                    relying on the validator name (as that can be spoofed).
                  </Text>
                </div>
              </div>
            </Card.Section>

            {/* Amount Input */}
            <Card.Section>
              <AssetValueInput
                amount={amount}
                onAmountChange={stakingStore.setAmount}
                selectedAsset={selectedAsset}
                onAssetChange={handleAssetChange}
                balances={balancesToShow}
                assets={[]}
                amountPlaceholder={`Amount to ${actionLabel.toLowerCase()}...`}
                assetDialogTitle={
                  action === 'delegate' ? 'Select UM Balance' : 'Select Delegation Tokens'
                }
                disabled={stakingStore.loading}
              />
            </Card.Section>
          </Card.Stack>

          {/* Buttons */}
          <div className='flex gap-2'>
            <Button
              actionType='default'
              priority='secondary'
              onClick={handleClose}
              disabled={stakingStore.loading}
            >
              Choose another
            </Button>
            <Button
              actionType='accent'
              onClick={handleSubmit}
              disabled={!isFormValid || stakingStore.loading}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
});
