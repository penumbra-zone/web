import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { Coins, Wallet2 } from 'lucide-react';
import { useBalancesStore } from '@shared/stores/store-context';
import { useIsConnected, useConnectWallet } from '@shared/hooks/use-connection';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import {
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { pnum } from '@penumbra-zone/types/pnum';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

interface AssetItem {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  icon?: string;
}

const NotConnectedState = () => {
  const { connectWallet } = useConnectWallet();

  return (
    <Card title="Assets">
      <div className='flex flex-col items-center justify-center min-h-[250px] gap-4'>
        <div className='size-8 text-text-secondary'>
          <Wallet2 className='w-full h-full' />
        </div>
        <Text color='text.secondary' small>
          Connect wallet to see your assets
        </Text>
        <div className='w-fit'>
          <Button 
            actionType='default' 
            density='compact'
            onClick={connectWallet}
          >
            Connect wallet
          </Button>
        </div>
      </div>
    </Card>
  );
};

const NoAssetsState = () => {
  return (
    <Card title="Assets">
      <div className='flex flex-col items-center justify-center h-[250px] gap-4'>
        <div className='size-8 text-neutral-light'>
          <Coins className='w-full h-full' />
        </div>
        <Text color='text.secondary' small>
          You have no assets yet. Deposit or receive any assets first to your wallet. They will appear here.
        </Text>
      </div>
    </Card>
  );
};

export const AssetCard = observer(() => {
  const balancesStore = useBalancesStore();
  const isConnected = useIsConnected();

  // Transform balances data for display
  const assetItems = useMemo(() => {
    return balancesStore.balancesResponses
      .map((balance: BalancesResponse) => {
        const valueView = getBalanceView.optional(balance);
        const metadata = getMetadataFromBalancesResponse.optional(balance);

        if (!valueView || !metadata) {
          return null;
        }

        // Get the proper display exponent for this asset
        const displayExponent = getDisplayDenomExponent(metadata);

        // Convert amount to display format with proper commas for large numbers
        const amount = valueView.valueView.value?.amount;
        const displayAmount = amount
          ? pnum(amount, displayExponent).toFormattedString({
              commas: true,
              decimals: 2, // Show 2 decimals for precise amounts
              trailingZeros: false,
            })
          : '0';

        // Get the proper metadata display values
        const symbol = metadata.symbol;
        const displayName = metadata.name || symbol;

        return {
          id: metadata.penumbraAssetId?.inner.toString() ?? '',
          name: displayName,
          symbol,
          amount: displayAmount,
          icon: metadata.images[0]?.png || metadata.images[0]?.svg || undefined,
        };
      })
      .filter(Boolean)
      .slice(0, 5); // Show top 5 assets
  }, [balancesStore.balancesResponses]);

  console.log('AssetCard - isConnected:', isConnected);
  console.log('AssetCard - balances length:', balancesStore.balancesResponses.length);
  console.log('AssetCard - assetItems:', assetItems);

  // If wallet is not connected, show connect wallet message
  if (!isConnected) {
    return <NotConnectedState />;
  }

  // If no balances, show empty state
  if (balancesStore.balancesResponses.length === 0) {
    return <NoAssetsState />;
  }

  return (
    <Card title="Assets">
      <div className='space-y-2'>
        {assetItems.map((asset: AssetItem | null, index: number) => (
          <div key={asset?.id || index} className='p-3 rounded-lg bg-other-tonalFill5'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-3'>
                {asset?.icon && (
                  <img 
                    src={asset.icon} 
                    alt={asset.symbol} 
                    className='w-6 h-6 rounded-full'
                  />
                )}
                <div>
                  <Text small color='text.primary'>
                    {asset?.name}
                  </Text>
                  <Text detail color='text.muted'>
                    {asset?.symbol}
                  </Text>
                </div>
              </div>
              <Text small color='text.primary'>
                {asset?.amount} {asset?.symbol}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}); 