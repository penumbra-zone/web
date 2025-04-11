import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Button } from '@penumbra-zone/ui/Button';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { Text } from '@penumbra-zone/ui/Text';
import { Card } from '@penumbra-zone/ui/Card';

import { ChainSelector } from './chain-selector';
import { InputToken } from './input-token';
import { InputBlock } from './input-block';
import { PublicBalance } from '@/pages/portfolio/api/use-unified-assets.ts';
import { ibcOutStore } from './ibc-out';
import { useBalances } from '@/shared/api/balances';
import { useAssets } from '@/shared/api/assets';
import { useStakingTokenMetadata } from '@/shared/api/registry';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

interface IbcWithdrawalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAsset?: PublicBalance;
  assets: PublicBalance[];
}

export const IbcWithdrawalDialog = observer(
  ({ isOpen, onClose, preselectedAsset, assets }: IbcWithdrawalDialogProps) => {
    // Use mobx store for state management
    const {
      amount,
      setAmount,
      chain,
      setChain,
      destinationChainAddress,
      setDestinationChainAddress,
      selection,
      sendIbcWithdraw,
      txInProgress,
    } = ibcOutStore;

    // Get data needed for validation and filtering
    const balancesQuery = useBalances();
    const assetsQuery = useAssets();
    const stakingTokenQuery = useStakingTokenMetadata();

    // Safely access query results
    const balances = (balancesQuery.data as BalancesResponse[]) ?? [];
    const metadataAssets = (assetsQuery.data as Metadata[]) ?? [];
    const stakingTokenMetadata = stakingTokenQuery.data as Metadata | undefined;

    // Reset form when opening with a preselected asset
    useEffect(() => {
      if (isOpen && preselectedAsset) {
        // Convert PublicBalance to BalancesResponse if needed
        // This would require mapping from your PublicBalance format to BalancesResponse
        // Example: const balanceResponse = convertToBalancesResponse(preselectedAsset);
        // setSelection(balanceResponse);
      }
    }, [isOpen, preselectedAsset]);

    // Get validation errors
    const validationErrors = ibcOutStore.getValidationErrors(
      balances,
      metadataAssets,
      stakingTokenMetadata,
    );

    // Handle submission
    const handleWithdraw = async () => {
      try {
        await sendIbcWithdraw();
        onClose();
      } catch (error) {
        console.error('Withdrawal failed', error);
      }
    };

    // Get placeholder text based on current state
    const placeholder = ibcOutStore.getPlaceholder(balances, metadataAssets, stakingTokenMetadata);

    return (
      <Dialog isOpen={isOpen} onClose={onClose}>
        <Dialog.Content title='Unshield Assets'>
          <Text color='text.primary'>Transfer assets from Penumbra to another blockchain</Text>

          <Card>
            <form
              className='flex flex-col gap-4 p-4'
              onSubmit={e => {
                e.preventDefault();
                void handleWithdraw();
              }}
            >
              <ChainSelector
                selectedChain={chain?.chainId ?? ''}
                onChainSelect={chainId => {
                  const selectedChain = ibcOutStore.chains.find(c => c.chainId === chainId);
                  setChain(selectedChain);
                }}
              />

              <InputToken
                label='Amount to send'
                placeholder={placeholder}
                className='mb-1'
                selection={
                  selection
                    ? ({
                        // This is a simplified example and would need to be updated with correct field mapping
                        id: String(selection.accountAddress?.addressIndex?.account ?? ''),
                        symbol: String(
                          selection.balanceView?.valueView?.knownAssetId?.value.metadata?.symbol ??
                            '',
                        ),
                        amount: String(
                          selection.balanceView?.valueView?.knownAssetId?.value.amount?.lo ?? '0',
                        ),
                        // Add other required fields...
                      } as unknown as PublicBalance)
                    : null
                }
                setSelection={(selected: PublicBalance | null) => {
                  // Convert PublicBalance to BalancesResponse if needed
                  // This is a placeholder for the actual conversion logic
                  console.log('Asset selection changed:', selected);
                  // setSelection(convertToBalancesResponse(selected));
                }}
                value={amount}
                onInputChange={newAmount => {
                  if (Number(newAmount) < 0) {
                    return;
                  }
                  setAmount(newAmount);
                }}
                validations={[
                  {
                    type: 'error',
                    issue: 'insufficient funds',
                    checkFn: () => validationErrors.amountErr,
                  },
                  {
                    type: 'error',
                    issue: 'invalid decimal length',
                    checkFn: () => validationErrors.exponentErr,
                  },
                ]}
                balances={assets}
              />

              <InputBlock
                label='Recipient on destination chain'
                className='mb-1'
                value={destinationChainAddress}
                validations={[
                  {
                    type: 'error',
                    issue: 'address not valid',
                    checkFn: () => validationErrors.recipientErr,
                  },
                ]}
              >
                <TextInput
                  placeholder='Enter the address'
                  value={destinationChainAddress}
                  onChange={setDestinationChainAddress}
                />
              </InputBlock>

              <Button
                type='submit'
                disabled={
                  !Number(amount) ||
                  !destinationChainAddress ||
                  !!Object.values(validationErrors).find(Boolean) ||
                  !selection ||
                  txInProgress
                }
                actionType='unshield'
              >
                <span>{txInProgress ? 'Processing...' : 'Unshield Assets'}</span>
              </Button>
            </form>
          </Card>
        </Dialog.Content>
      </Dialog>
    );
  },
);
