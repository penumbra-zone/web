import React, { useMemo, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { useWithdrawStore } from '@/shared/stores/store-context';
import { useUnifiedAssets, UnifiedAsset } from '@/shared/api/use-unified-assets';
import { useRegistry } from '@/shared/api/use-registry';
import { IbcChainProvider } from '@/shared/api/chain-provider';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { ChainSelector } from '../chain-selector';
import { AssetValueInput } from '@penumbra-zone/ui/AssetValueInput';
import { Density } from '@penumbra-zone/ui/Density';
import { LogOut } from 'lucide-react';
import { Wallet2 } from 'lucide-react';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { useChain } from '@cosmos-kit/react';

const NATIVE_TRANSFERS_ONLY_CHAIN_IDS = ['celestia'];

const commonSectionClasses = 'flex flex-col bg-other-tonal-fill5 p-3 gap-1';
const firstSectionClasses = `${commonSectionClasses} rounded-t-sm rounded-b-none`;
const middleSectionClasses = `${commonSectionClasses}`;
const lastSectionClasses = `${commonSectionClasses} rounded-t-none rounded-b-sm`;

const WithdrawFormInternal: React.FC = observer(() => {
  const withdrawStore = useWithdrawStore();
  const { unifiedAssets } = useUnifiedAssets();
  const addressInputRef = useRef<HTMLInputElement>(null);

  const { withdrawState, availableChains, validation, canWithdraw } = withdrawStore;

  const selectedChainName = withdrawState.selectedChain?.chainName || 'osmosis';
  const { connect, disconnect, address: walletAddress, status } = useChain(selectedChainName);

  const isWalletConnected = status === 'Connected';
  const isWalletConnecting = status === 'Connecting';

  useEffect(() => {
    void withdrawStore.initialize();
  }, [withdrawStore]);

  useEffect(() => {
    if (
      isWalletConnected &&
      walletAddress &&
      withdrawState.selectedChain &&
      !withdrawState.destinationAddress
    ) {
      withdrawStore.setDestinationAddress(walletAddress);
    }
  }, [
    isWalletConnected,
    walletAddress,
    withdrawState.selectedChain,
    withdrawState.destinationAddress,
    withdrawStore,
  ]);

  const assetBalances: BalancesResponse[] = useMemo(() => {
    if (!withdrawState.selectedChain) {
      return [];
    }

    const convertedUnsorted = unifiedAssets
      .filter((asset: UnifiedAsset) => {
        if (!asset.shieldedBalances.length) {
          return false;
        }

        const positiveBalances = asset.shieldedBalances.filter(balance => {
          const amount = pnum(balance.valueView).toNumber();
          return amount > 0;
        });

        if (positiveBalances.length === 0) {
          return false;
        }

        const metadata = asset.metadata;
        const baseDenom = metadata.base;

        if (baseDenom === 'upenumbra') {
          const allowed = !NATIVE_TRANSFERS_ONLY_CHAIN_IDS.includes(
            withdrawState.selectedChain!.chainId,
          );
          return allowed;
        }

        const ibcMatch = assetPatterns.ibc.capture(baseDenom);
        if (ibcMatch) {
          const assetChannelId = ibcMatch.channel;
          const selectedChannelId = withdrawState.selectedChain!.channelId;

          const matches = assetChannelId === selectedChannelId;
          return matches;
        }

        return false;
      })
      .flatMap((asset: UnifiedAsset) => {
        return asset.shieldedBalances
          .map(shieldedBalance => {
            try {
              const accountIndex = getAddressIndex(shieldedBalance.balance.accountAddress);
              const balancesResponse = new BalancesResponse({
                balanceView: shieldedBalance.valueView,
                accountAddress: new AddressView({
                  addressView: {
                    case: 'decoded',
                    value: {
                      address: { inner: new Uint8Array(80) },
                      index: {
                        account: accountIndex.account,
                        randomizer: new Uint8Array([0, 0, 0]),
                      },
                    },
                  },
                }),
              });

              return balancesResponse;
            } catch (error) {
              console.error('Error creating BalancesResponse for:', asset.symbol, error);
              return null;
            }
          })
          .filter(Boolean);
      })
      .filter(Boolean) as BalancesResponse[];

    const sorted = convertedUnsorted.sort((a, b) => {
      const metaA =
        a.balanceView?.valueView.case === 'knownAssetId'
          ? a.balanceView.valueView.value?.metadata
          : undefined;
      const metaB =
        b.balanceView?.valueView.case === 'knownAssetId'
          ? b.balanceView.valueView.value?.metadata
          : undefined;
      const aIsIbc = metaA?.symbol?.toLowerCase().startsWith('ibc/') ?? false;
      const bIsIbc = metaB?.symbol?.toLowerCase().startsWith('ibc/') ?? false;
      if (aIsIbc === bIsIbc) return 0;
      return aIsIbc ? 1 : -1;
    });

    return sorted;
  }, [unifiedAssets, withdrawState.selectedChain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void withdrawStore.executeWithdrawal();
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);

      // Show user-friendly error message instead of crashing
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('not provided')) {
        console.warn(
          `Wallet support not available for ${withdrawState.selectedChain?.displayName}`,
        );
      }
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleMyAddressClick = async () => {
    if (!withdrawState.selectedChain) {
      return;
    }

    if (!isWalletConnected) {
      await handleConnectWallet();
    } else if (walletAddress) {
      withdrawStore.setDestinationAddress(walletAddress);
      addressInputRef.current?.focus();
    }
  };

  const sectionTitleColor = undefined;
  const isFormDisabled = withdrawState.isLoading;

  return (
    <div className='flex w-full flex-col rounded-sm'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        {/* External Wallet Connection Section */}
        {!isWalletConnected && (
          <Button actionType='default' onClick={handleConnectWallet} disabled={isWalletConnecting}>
            {isWalletConnecting ? 'Connecting...' : 'Connect External Wallet'}
          </Button>
        )}

        {/* Connected Wallet Info */}
        {isWalletConnected && walletAddress && (
          <div className='flex items-center justify-between p-3 bg-other-tonal-fill5 rounded-sm'>
            <div className='flex flex-col gap-1'>
              <Text detail color='text.secondary'>
                Connected to {withdrawState.selectedChain?.displayName || 'External Chain'}
              </Text>
              <Text small>
                {walletAddress.slice(0, 20)}...{walletAddress.slice(-10)}
              </Text>
            </div>
            <Button
              actionType='default'
              density='compact'
              onClick={handleDisconnectWallet}
              icon={LogOut}
              iconOnly
              aria-label='Disconnect wallet'
            >
              Disconnect
            </Button>
          </div>
        )}

        <div className={firstSectionClasses}>
          <Text color={sectionTitleColor}>Destination Chain</Text>
          <ChainSelector
            selectedChain={withdrawState.selectedChain}
            availableChains={availableChains}
            onSelectChain={chain => withdrawStore.setSelectedChain(chain)}
            disabled={isFormDisabled}
          />
        </div>

        <div className={middleSectionClasses}>
          <Text color={withdrawState.selectedChain ? sectionTitleColor : 'text.muted'}>Amount</Text>
          <AssetValueInput
            amount={withdrawState.amount}
            onAmountChange={(amount: string) => withdrawStore.setAmount(amount)}
            selectedAsset={withdrawState.selectedAsset}
            onAssetChange={(asset: BalancesResponse) => {
              withdrawStore.setSelectedAsset(asset);
            }}
            balances={assetBalances}
            assets={[]}
            amountPlaceholder={
              !withdrawState.selectedChain
                ? 'Select a chain first...'
                : assetBalances.length === 0
                  ? `No assets available for withdrawal to ${withdrawState.selectedChain.displayName}...`
                  : 'Amount to withdraw...'
            }
            assetDialogTitle={`Select Asset`}
            showBalance={true}
            disabled={isFormDisabled || !withdrawState.selectedChain}
          />
        </div>

        <div className={lastSectionClasses}>
          <Text color={sectionTitleColor}>Recipient Address</Text>
          <TextInput
            ref={addressInputRef}
            placeholder={
              withdrawState.selectedChain
                ? `Enter a valid ${withdrawState.selectedChain.displayName} address (${withdrawState.selectedChain.addressPrefix}...)`
                : 'Select a chain first'
            }
            value={withdrawState.destinationAddress}
            onChange={withdrawStore.setDestinationAddress}
            disabled={isFormDisabled || !withdrawState.selectedChain}
            endAdornment={
              <Button
                type='button'
                iconOnly
                density='compact'
                onClick={handleMyAddressClick}
                aria-label={
                  !withdrawState.selectedChain
                    ? 'Select a chain first'
                    : !isWalletConnected
                      ? 'Connect wallet'
                      : 'Use my wallet address'
                }
                icon={Wallet2}
                disabled={!withdrawState.selectedChain || isWalletConnecting}
              >
                {!isWalletConnected ? 'Connect' : 'My Address'}
              </Button>
            }
          />
          {validation.addressError && (
            <Text detail color='destructive.light'>
              Invalid address format for {withdrawState.selectedChain?.displayName}
            </Text>
          )}
        </div>

        {withdrawState.error && (
          <div className='rounded-lg p-3'>
            <Text color='destructive.light' small>
              Failed: {withdrawState.error}
            </Text>
          </div>
        )}

        <Density sparse>
          <Button
            type='submit'
            disabled={!canWithdraw || withdrawState.isLoading}
            actionType='unshield'
          >
            {withdrawState.isLoading ? 'Processing Unshielding...' : 'Unshield'}
          </Button>
        </Density>
      </form>
    </div>
  );
});

export const WithdrawForm = observer(() => {
  const { data: registry } = useRegistry();

  if (!registry) {
    return <div>Loading registry...</div>;
  }

  return (
    <IbcChainProvider registry={registry}>
      <WithdrawFormInternal />
    </IbcChainProvider>
  );
});
