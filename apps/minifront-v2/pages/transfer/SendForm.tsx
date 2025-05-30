import { observer } from 'mobx-react-lite';
import { useTransferStore, useBalancesStore, useAssetsStore } from '@shared/stores/store-context';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { AssetValueInput } from '@penumbra-zone/ui/AssetValueInput';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { FeeTier_Tier } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { Send, AlertCircle, Fuel } from 'lucide-react';
import { useMemo, useEffect } from 'react';
import { Density } from '@penumbra-zone/ui';

export const SendForm = observer(() => {
  const transferStore = useTransferStore();
  const balancesStore = useBalancesStore();
  const assetsStore = useAssetsStore();

  const { sendState, sendValidation, canSend } = transferStore;

  // Filter balances for transferable assets
  const transferableBalances = useMemo(() => {
    return balancesStore.balancesResponses.filter(balance => {
      // Filter logic for transferable balances
      return balance.balanceView?.valueView?.case === 'knownAssetId';
    });
  }, [balancesStore.balancesResponses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    transferStore.sendTransaction();
  };

  // Create fee ValueView for display
  const feeValueView = useMemo(() => {
    if (!sendState.fee?.amount || !sendState.feeAssetMetadata) return undefined;

    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: sendState.fee.amount,
          metadata: sendState.feeAssetMetadata,
          equivalentValues: [],
        },
      },
    });
  }, [sendState.fee, sendState.feeAssetMetadata]);

  useEffect(() => {
    // Trigger initial fee estimation after a brief delay to ensure stores are loaded
    const timer = setTimeout(() => {
      console.log('SendForm: Triggering initial fee estimation...');
      transferStore.estimateFee();
    }, 100);

    return () => clearTimeout(timer);
  }, [transferStore]);

  return (
    <div className='p-4rounded-sm'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-1'>
        {/* Recipient Address */}
        <div className='flex flex-col gap-1 p-3 bg-other-tonalFill5 rounded-sm'>
          <Text strong>Recipient</Text>
          <TextInput
            value={sendState.recipient}
            onChange={e => transferStore.setSendRecipient(e)}
            placeholder="Recipient's Address..."
          />
          {sendValidation.recipientError && (
            <Text small color='destructive.light'>
              <div className='flex items-center gap-1'>
                <AlertCircle className='w-3 h-3' />
                Invalid address
              </div>
            </Text>
          )}
        </div>

        {/* Amount and Asset Selection */}
        <div className='flex flex-col gap-1 p-3 bg-other-tonalFill5 rounded-sm'>
          <Text strong>Amount</Text>
          <AssetValueInput
            amount={sendState.amount}
            onAmountChange={value => transferStore.setSendAmount(value)}
            selectedAsset={sendState.selectedAsset}
            onAssetChange={asset => transferStore.setSelectedAsset(asset)}
            balances={transferableBalances}
            assets={assetsStore.allAssets}
            amountPlaceholder='Amount to send...'
            assetDialogTitle='Select Asset'
            errors={{
              amountError: sendValidation.amountError,
              exponentError: sendValidation.exponentError,
              insufficientFunds: sendValidation.amountError, // Map insufficient funds to amountError for now
            }}
            errorMessages={{
              amountError: 'Insufficient funds',
              exponentError: 'Invalid decimal length',
              insufficientFunds: 'Insufficient funds',
            }}
            showBalance={true}
          />
        </div>

        {/* Fee Tier Selection */}
        <div className='flex flex-col gap-1 p-3 bg-other-tonalFill5 rounded-sm'>
          <div className='flex items-center justify-between'>
            <Text strong>Fee Tier</Text>
          </div>
          <div className='flex flex-row gap-1 justify-between'>
            <div className='flex gap-1'>
              <Density slim>
                <Button
                  actionType={sendState.feeTier === FeeTier_Tier.LOW ? 'default' : 'default'}
                  priority={sendState.feeTier === FeeTier_Tier.LOW ? 'primary' : 'secondary'}
                  onClick={() => transferStore.setFeeTier(FeeTier_Tier.LOW)}
                >
                  Low
                </Button>
                <Button
                  actionType={sendState.feeTier === FeeTier_Tier.MEDIUM ? 'accent' : 'default'}
                  priority={sendState.feeTier === FeeTier_Tier.MEDIUM ? 'primary' : 'secondary'}
                  onClick={() => transferStore.setFeeTier(FeeTier_Tier.MEDIUM)}
                >
                  Medium
                </Button>
                <Button
                  actionType={sendState.feeTier === FeeTier_Tier.HIGH ? 'accent' : 'default'}
                  priority={sendState.feeTier === FeeTier_Tier.HIGH ? 'primary' : 'secondary'}
                  onClick={() => transferStore.setFeeTier(FeeTier_Tier.HIGH)}
                >
                  High
                </Button>
              </Density>
            </div>
            <div className='flex items-center gap-2'>
              <div className=''>
                <Fuel className='w-3 h-3 text-text-secondary' />
              </div>
              {sendState.isFeeLoading ? (
                <Text small color='text.secondary'>
                  Estimating...
                </Text>
              ) : feeValueView ? (
                <Density compact>
                  <ValueViewComponent
                    valueView={feeValueView}
                    showIcon={true}
                    showSymbol={true}
                    density='compact'
                  />
                </Density>
              ) : (
                <Text small color='text.secondary'>
                  No Fees
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* Memo */}
        <div className='flex flex-col gap-1 p-3 bg-other-tonalFill5 rounded-sm'>
          <Text strong>Memo</Text>
          <TextInput
            value={sendState.memo}
            onChange={e => transferStore.setSendMemo(e)}
            placeholder="What's this for?"
          />
          {sendValidation.memoError && (
            <Text small color='destructive.light'>
              <div className='flex items-center gap-1'>
                <AlertCircle className='w-3 h-3' />
                Memo too long
              </div>
            </Text>
          )}
          <div className='flex items-center gap-1'>
            <AlertCircle className='w-4 h-4 text-text-secondary' />
            <Text small color='text.secondary'>
              Memo's are required.
            </Text>
          </div>
        </div>

        {/* Error message */}
        {sendState.error && (
          <div className='p-3 rounded-lg bg-destructive/10 border border-destructive/20'>
            <Text color='destructive.light' small>
              {sendState.error}
            </Text>
          </div>
        )}

        {/* Submit Button */}
        <div className='mt-2 rounded-sm'>
          <Button
            type='submit'
            disabled={!canSend || sendState.isLoading}
            actionType='accent'
            icon={Send}
          >
            {sendState.isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
});
