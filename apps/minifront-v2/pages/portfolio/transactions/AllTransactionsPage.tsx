import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { Metadata, AssetId, Denom } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

import { useBalancesStore } from '@shared/stores/store-context';
import { useIsConnected, useConnectWallet } from '@shared/hooks/use-connection';
import { PagePath } from '@shared/const/page';
import { Card } from '@penumbra-zone/ui/Card';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Wallet2 } from 'lucide-react';

// Utility function to compare Uint8Arrays
const compareUint8Arrays = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

import { BreadCrumb, BreadcrumbItem } from '@shared/ui/breadcrumb';
import { InfoDialog } from '../assets/InfoDialog';
import { TransactionView } from './TransactionView';
import { TransactionCard } from './TransactionCard';

export const AllTransactionsPage = observer(() => {
  const balancesStore = useBalancesStore();
  const balancesResponses = balancesStore.balancesResponses;
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTx = searchParams.get('tx');
  const isConnected = useIsConnected();
  const { connectWallet } = useConnectWallet();

  // Extract wallet address views from balances responses (similar to TransactionCard)
  const walletAddressViews = useMemo((): AddressView[] => {
    if (!balancesResponses) {
      return [];
    }

    const addressMap = new Map<string | number, AddressView>();

    for (const response of balancesResponses) {
      const accountAddress = response.accountAddress;
      if (accountAddress) {
        const key =
          accountAddress.addressView.case === 'decoded' &&
          accountAddress.addressView.value.index?.account !== undefined
            ? accountAddress.addressView.value.index.account
            : accountAddress.toJsonString();

        addressMap.set(key, accountAddress);
      }
    }

    // Convert map values to array
    return Array.from(addressMap.values());
  }, [balancesResponses]);

  const getTxMetadata = (assetId?: AssetId | Denom): Metadata | undefined => {
    if (!assetId || !balancesResponses) {
      return undefined;
    }
    // Check for AssetId first
    if (assetId instanceof AssetId) {
      for (const res of balancesResponses) {
        const metadata = getMetadataFromBalancesResponse.optional(res);
        if (
          metadata?.penumbraAssetId?.inner &&
          compareUint8Arrays(metadata.penumbraAssetId.inner, assetId.inner)
        ) {
          return metadata;
        }
      }
    } else {
      // Must be Denom or string
      const denomToFind = typeof assetId === 'string' ? assetId : assetId.denom;
      for (const res of balancesResponses) {
        const metadata = getMetadataFromBalancesResponse.optional(res);
        if (metadata) {
          if (
            metadata.base === denomToFind ||
            metadata.display === denomToFind ||
            metadata.symbol === denomToFind
          ) {
            return metadata;
          }
          return metadata;
        }
      }
    }
    return undefined;
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Portfolio', path: PagePath.Portfolio },
    { label: 'Your Transactions' },
  ];

  const maxWidth = selectedTx ? 1200 : 752;

  const handleDeselectTransaction = () => {
    setSearchParams(prev => {
      prev.delete('tx');
      return prev;
    });
  };

  // If wallet is not connected, show connect wallet message
  if (!isConnected) {
    return (
      <div className='flex w-full flex-col items-center'>
        <div className='flex w-full flex-col' style={{ maxWidth: '752px' }}>
          <div className='flex items-center justify-between px-3 py-4'>
            <BreadCrumb items={breadcrumbItems} />
          </div>
          <Card title='Your Transactions'>
            <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
              <div className='size-8 text-text-secondary'>
                <Wallet2 className='w-full h-full' />
              </div>
              <Text color='text.secondary' small>
                Connect wallet to see your transactions
              </Text>
              <div className='w-fit'>
                <Button actionType='default' density='compact' onClick={connectWallet}>
                  Connect wallet
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col items-center'>
      <div className='flex w-full flex-col' style={{ maxWidth: `${maxWidth}px` }}>
        <div className='flex items-center justify-between px-3 py-4'>
          <BreadCrumb items={breadcrumbItems} />
          {!selectedTx && <InfoDialog />}
        </div>
        <div className='flex w-full flex-col gap-4 md:flex-row'>
          <div className={`flex w-full flex-col ${selectedTx ? 'md:w-1/2' : ''}`}>
            <TransactionCard
              title={null}
              showSeeAllLink={false}
              showInfoButton={false}
              // maxItems is not set, TransactionCard will show all summaries
            />
          </div>
          {selectedTx && (
            <div className='flex size-full flex-col items-start md:w-1/2'>
              <TransactionView
                key={selectedTx}
                txHash={selectedTx}
                getTxMetadata={getTxMetadata}
                walletAddressViews={walletAddressViews}
                onDeselectTransaction={handleDeselectTransaction}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
