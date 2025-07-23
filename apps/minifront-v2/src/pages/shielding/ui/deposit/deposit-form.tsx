import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { AccountSelector } from '@penumbra-zone/ui/AccountSelector';
import { Shield, Info } from 'lucide-react';
import { useChain } from '@cosmos-kit/react';
import { useDepositStore } from '@/shared/stores/store-context';
import { ChainSelector } from '../chain-selector';
import { AssetValueInput } from '@penumbra-zone/ui/AssetValueInput';
import { Density } from '@penumbra-zone/ui/Density';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { LogOut } from 'lucide-react';
import { useUnifiedAssets, UnifiedAsset } from '@/shared/api/use-unified-assets';
import { useRegistry } from '@/shared/api/use-registry';
import { IbcChainProvider } from '@/shared/api/chain-provider';
import { pnum } from '@penumbra-zone/types/pnum';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

// Internal form component that uses cosmos-kit hooks
const DepositFormInternal = observer(() => {
  // Common class constants for form sections
  const commonSectionClasses = 'flex flex-col bg-other-tonal-fill5 p-3 gap-1';
  const firstSectionClasses = `${commonSectionClasses} rounded-t-sm rounded-b-none`;
  const middleSectionClasses = `${commonSectionClasses}`;
  const lastSectionClasses = `${commonSectionClasses} rounded-t-none rounded-b-sm`;

  const depositStore = useDepositStore();
  const { depositState, walletState, validation, canDeposit, availableChains } = depositStore;

  // Use unified assets (now safely within ChainProvider context)
  const { unifiedAssets, isLoading: assetsLoading } = useUnifiedAssets();

  // Get cosmos-kit chain connection for the selected chain
  const selectedChainName = depositState.selectedChain?.chainName || 'osmosis';
  const { connect, disconnect, address, status, getSigningStargateClient } =
    useChain(selectedChainName);

  // Check connection status from cosmos-kit
  const isConnected = status === 'Connected';
  const isConnecting = status === 'Connecting';

  // Filter assets to only those from the selected chain and with non-zero amounts
  const availableAssets = useMemo(() => {
    if (!depositState.selectedChain) {
      return [];
    }

    const filtered = unifiedAssets.filter(
      asset =>
        asset.publicBalances.length > 0 &&
        asset.publicBalances.some(balance => {
          const amount = pnum(balance.valueView).toNumber();
          const isFromSelectedChain = balance.chainId === depositState.selectedChain?.chainId;
          return amount > 0 && isFromSelectedChain;
        }),
    );

    return filtered;
  }, [unifiedAssets, depositState.selectedChain]);

  // Convert unified assets to BalancesResponse objects with proper balance info
  const assetBalances: BalancesResponse[] = useMemo(() => {
    const convertedUnsorted = availableAssets
      .map((asset: UnifiedAsset) => {
        // Find the balance for the selected chain
        const publicBalance = asset.publicBalances.find(
          balance => balance.chainId === depositState.selectedChain?.chainId,
        );

        if (!publicBalance) {
          return null;
        }

        try {
          // Construct an AddressView with a decoded index so that downstream helpers
          // (e.g. groupAndSortBalances) can extract the account information and make
          // the balance visible inside the AssetSelector.
          const balancesResponse = new BalancesResponse({
            balanceView: publicBalance.valueView,
            accountAddress: new AddressView({
              addressView: {
                case: 'decoded',
                value: {
                  // Empty 80-byte address placeholder – we only care about the account index.
                  address: { inner: new Uint8Array(80) },
                  index: {
                    account: 0,
                    // Zeroed randomizer means a default address (non one-time)
                    randomizer: new Uint8Array([0, 0, 0]),
                  },
                },
              },
            }),
          });

          return balancesResponse;
        } catch (error) {
          console.error('❌ Error creating BalancesResponse for:', asset.symbol, error);
          return null;
        }
      })
      .filter(Boolean) as BalancesResponse[];
    // Sort such that assets whose symbol starts with 'ibc/' come AFTER registry ones
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
  }, [availableAssets, depositState.selectedChain]);

  // Sync cosmos-kit state with our store
  useEffect(() => {
    if (isConnected && address && depositState.selectedChain) {
      depositStore.onWalletConnected(address, depositState.selectedChain.chainId);
    } else if (!isConnected && walletState.isConnected) {
      depositStore.disconnectWallet();
    }
  }, [isConnected, address, depositState.selectedChain, depositStore, walletState.isConnected]);

  // Update connecting state
  useEffect(() => {
    if (isConnecting !== walletState.isConnecting) {
      if (isConnecting) {
        depositStore.walletState.isConnecting = true;
      } else {
        depositStore.walletState.isConnecting = false;
      }
    }
  }, [isConnecting, walletState.isConnecting, depositStore]);

  // Determine if form should be disabled
  const isFormDisabled = !isConnected || depositState.isLoading;

  // Determine muted color for section titles if wallet is not connected
  const sectionTitleColor = isConnected ? undefined : 'text.muted';

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      depositStore.onWalletConnectionError(
        error instanceof Error ? error.message : 'Failed to connect wallet',
      );
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleChainSelect = (chain: any) => {
    depositStore.setSelectedChain(chain);
  };

  const handleAmountChange = (amount: string) => {
    depositStore.setAmount(amount);
  };

  const handleAccountChange = (index: number) => {
    depositStore.setDestinationAccount(index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!getSigningStargateClient || !address) {
      depositStore.onWalletConnectionError('Wallet not ready to sign');
      return;
    }

    void depositStore.initiateDeposit(getSigningStargateClient, address);
  };

  const getAccountDisplayName = (index: number) => {
    if (index === 0) return 'Main Account';
    return `Account ${index}`;
  };

  // Find the selected asset balance
  const selectedAssetBalance: BalancesResponse | undefined = useMemo(() => {
    if (depositState.selectedAsset) {
      // Try to find the BalancesResponse that matches the selected asset (by symbol or denom)
      return assetBalances.find(br => {
        const metadata =
          br.balanceView?.valueView.case === 'knownAssetId'
            ? br.balanceView.valueView.value?.metadata
            : undefined;

        const symbolMatches = metadata?.symbol === depositState.selectedAsset?.metadata?.symbol;
        const denomMatches = metadata?.base === depositState.selectedAsset?.denom; // fallback

        return symbolMatches || denomMatches;
      });
    }

    // fallback to first available
    return assetBalances[0];
  }, [assetBalances, depositState.selectedAsset]);

  // NEW: When we have a fallback selected asset (derived from balances) but the
  // store has not yet been updated, sync it so validation can succeed.
  useEffect(() => {
    if (!depositState.selectedAsset && selectedAssetBalance && depositState.selectedChain) {
      // Locate the unified asset that matches the selected balance so we can
      // convert it into the ExternalAssetBalance shape expected by the store.
      const matchingUnified = availableAssets.find(ua => {
        const publicBalance = ua.publicBalances.find(
          b => b.chainId === depositState.selectedChain!.chainId,
        );
        if (!publicBalance) return false;

        const meta =
          selectedAssetBalance.balanceView?.valueView.case === 'knownAssetId'
            ? selectedAssetBalance.balanceView.valueView.value?.metadata
            : undefined;
        return meta?.symbol === ua.metadata.symbol;
      });

      if (matchingUnified) {
        const publicBalance = matchingUnified.publicBalances.find(
          b => b.chainId === depositState.selectedChain!.chainId,
        );
        if (publicBalance) {
          const externalAsset = {
            denom: publicBalance.denom,
            amount: pnum(publicBalance.valueView).toAmount().toString(),
            displayDenom: matchingUnified.metadata.display || matchingUnified.metadata.symbol,
            displayAmount: pnum(publicBalance.valueView).toNumber().toString(),
            metadata: matchingUnified.metadata,
          } as const;
          depositStore.setSelectedAsset(externalAsset);
        }
      }
    }
  }, [
    depositState.selectedAsset,
    selectedAssetBalance,
    depositState.selectedChain,
    availableAssets,
    depositStore,
  ]);

  // Handle asset change from AssetValueInput
  const handleAssetValueInputChange = (asset: Metadata | BalancesResponse) => {
    // Find the corresponding UnifiedAsset for the selected BalancesResponse
    if ('balanceView' in asset && asset.balanceView) {
      // This is a BalancesResponse - find the matching UnifiedAsset
      const selectedUnifiedAsset = availableAssets.find(unifiedAsset => {
        const publicBalance = unifiedAsset.publicBalances.find(
          balance => balance.chainId === depositState.selectedChain?.chainId,
        );

        if (!publicBalance) return false;

        // Compare metadata symbols
        const assetMetadata =
          asset.balanceView?.valueView?.case === 'knownAssetId'
            ? asset.balanceView.valueView.value?.metadata
            : undefined;

        return assetMetadata?.symbol === unifiedAsset.metadata.symbol;
      });

      if (selectedUnifiedAsset) {
        // Convert to ExternalAssetBalance format for the store
        const publicBalance = selectedUnifiedAsset.publicBalances.find(
          balance => balance.chainId === depositState.selectedChain?.chainId,
        );

        if (publicBalance) {
          const externalAsset = {
            denom: publicBalance.denom,
            amount: pnum(publicBalance.valueView).toAmount().toString(),
            displayDenom:
              selectedUnifiedAsset.metadata.display || selectedUnifiedAsset.metadata.symbol,
            displayAmount: pnum(publicBalance.valueView).toNumber().toString(),
            metadata: selectedUnifiedAsset.metadata,
          };

          depositStore.setSelectedAsset(externalAsset);
        }
      }
    }
  };

  return (
    <div className='flex w-full flex-col rounded-sm'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        {/* External Wallet Connection Section */}
        {!isConnected && (
          <>
            {walletState.error && (
              <div className='rounded-lg border border-destructive-light/20 bg-destructive-light/10 p-3 mt-2'>
                <Text color='destructive.light' small>
                  {walletState.error}
                </Text>
              </div>
            )}

            <Button actionType='default' onClick={handleConnectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect External Wallet'}
            </Button>
          </>
        )}

        {/* Connected Wallet Info */}
        {isConnected && address && (
          <div className='flex items-center justify-between p-3 bg-other-tonal-fill5 rounded-sm'>
            <div className='flex flex-col gap-1'>
              <Text detail color='text.secondary'>
                Connected to {depositState.selectedChain?.displayName}
              </Text>
              <Text small>
                {address.slice(0, 20)}...{address.slice(-10)}
              </Text>
            </div>
            <Button
              actionType='default'
              onClick={handleDisconnectWallet}
              iconOnly
              icon={LogOut}
              density='compact'
            >
              Disconnect
            </Button>
          </div>
        )}

        <div className='flex flex-col gap-1'>
          {/* Source Chain Selection */}
          <div className={firstSectionClasses}>
            <Text color={sectionTitleColor}>Source Chain</Text>
            <ChainSelector
              selectedChain={depositState.selectedChain}
              availableChains={availableChains}
              onSelectChain={handleChainSelect}
              disabled={isFormDisabled}
            />
            {validation.chainError && (
              <div className='flex items-center gap-1 mt-1'>
                <Info className={`h-3 w-3 ${isConnected ? 'text-secondary' : 'text-text-muted'}`} />
                <Text detail color={isConnected ? 'text.secondary' : 'text.muted'}>
                  This is the chain the assets will be transferred from.
                </Text>
              </div>
            )}
          </div>

          {/* Asset Selection */}
          <div className={middleSectionClasses}>
            <Text color={depositState.selectedChain ? sectionTitleColor : 'text.muted'}>
              Amount
            </Text>

            {/* Show loading state for assets */}
            {assetsLoading && isConnected && (
              <div className='flex items-center gap-2 py-2'>
                <Text detail color='text.secondary'>
                  Loading available assets...
                </Text>
              </div>
            )}

            <AssetValueInput
              amount={depositState.amount}
              onAmountChange={handleAmountChange}
              selectedAsset={selectedAssetBalance}
              onAssetChange={handleAssetValueInputChange}
              balances={assetBalances} // Use BalancesResponse for external shieldable assets
              assets={[]} // No metadata for external shieldable assets
              amountPlaceholder={
                !isConnected
                  ? 'Connect wallet to see assets...'
                  : !depositState.selectedChain
                    ? 'Select a chain first...'
                    : assetsLoading
                      ? 'Loading supported assets...'
                      : availableAssets.length === 0
                        ? 'No supported shieldable assets found on this chain...'
                        : 'Amount to shield...'
              }
              assetDialogTitle='Select Shieldable Asset'
              showBalance={true} // Show balance info for BalancesResponse
              disabled={
                isFormDisabled ||
                assetsLoading ||
                !depositState.selectedChain ||
                (isConnected && availableAssets.length === 0)
              }
            />

            {/* Show no assets message */}
            {!assetsLoading &&
              isConnected &&
              depositState.selectedChain &&
              availableAssets.length === 0 && (
                <div className='flex flex-col gap-1 py-2'>
                  <div className='flex items-center gap-1'>
                    <Info className='h-3 w-3 text-text-secondary' />
                    <Text detail color='text.secondary'>
                      No assets found on this chain
                    </Text>
                  </div>
                </div>
              )}
          </div>

          {/* Destination Account */}
          <div className={lastSectionClasses}>
            <Text color={sectionTitleColor}>Destination</Text>
            <Density compact>
              <AccountSelector
                value={depositState.destinationAccount}
                onChange={handleAccountChange}
                canGoPrevious={depositState.destinationAccount > 0}
                canGoNext={true}
                getDisplayValue={getAccountDisplayName}
                disabled={isFormDisabled}
              />
            </Density>
          </div>

          {/* Error Display */}
          {depositState.error && (
            <div className='rounded-lg p-3'>
              <Text color='destructive.light' small>
                Failed: {depositState.error}
              </Text>
            </div>
          )}

          {/* Submit Button */}
          <div className='mt-2'>
            <Density sparse>
              <Button
                type='submit'
                disabled={!canDeposit || depositState.isLoading}
                actionType='accent'
                icon={Shield}
              >
                {depositState.isLoading ? 'Shielding...' : 'Shield Assets'}
              </Button>
            </Density>
          </div>
        </div>
      </form>
    </div>
  );
});

// External wrapper component that provides ChainProvider context
export const DepositForm = observer(() => {
  // Get registry for chain filtering
  const { data: registry } = useRegistry();

  // Wrap the form in IBC chain provider if registry is loaded
  if (!registry) {
    return <div>Loading registry...</div>;
  }

  return (
    <IbcChainProvider registry={registry}>
      <DepositFormInternal />
    </IbcChainProvider>
  );
});
