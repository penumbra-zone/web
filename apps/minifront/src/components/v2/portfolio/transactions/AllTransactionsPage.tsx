import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { Metadata, AssetId, Denom } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

import { useBalancesResponses } from '../../../../state/shared';
import { compareUint8Arrays } from '../../../../hooks/v2/transactions-v2';
import { PagePath } from '../../../metadata/paths';
import { BreadCrumb, BreadcrumbItem } from '../../shared/BreadCrumb';
import { InfoDialog } from '../assets/InfoDialog';
import { TransactionView } from './TransactionView';
import { TransactionCard } from './TransactionCard';

export const AllTransactionsPage = () => {
  const { data: balancesResponses } = useBalancesResponses(); // Still needed for getTxMetadata if passed down
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTx = searchParams.get('tx');

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
    { label: 'Portfolio', path: PagePath.V2_PORTFOLIO },
    { label: 'Your Transactions' },
  ];

  const maxWidth = selectedTx ? 1200 : 752;

  const handleDeselectTransaction = () => {
    setSearchParams(prev => {
      prev.delete('tx');
      return prev;
    });
  };

  return (
    <div className='flex w-full flex-col items-center'>
      <div className='flex w-full flex-col' style={{ maxWidth: `${maxWidth}px` }}>
        <div className='flex items-center justify-between px-3 py-1'>
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
};
