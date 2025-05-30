import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import {
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { pnum } from '@penumbra-zone/types/pnum';

import { useBalancesStore } from '@shared/stores/store-context';
import { BalancesByAccount } from '@shared/stores/balances-store';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AssetCard } from './assets/AssetCard';
import { TransactionCard } from './transactions/TransactionCard';
import { AssetData, AccountData } from './assets/AssetCard/types';
import { centralEnhanceMetadata } from '@shared/utils/metadata-enhancement';

export const Portfolio = observer(() => {
  const balancesStore = useBalancesStore();

  // Transform balances data to format expected by AssetCard
  const accounts = useMemo(() => {
    if (balancesStore.loading || !balancesStore.balancesByAccount.length) {
      return [];
    }

    return balancesStore.balancesByAccount.map((account: BalancesByAccount) => {
      // The addressView should be the AddressView protobuf message itself
      const firstBalance = account.balances[0];
      const addressView = firstBalance?.accountAddress;

      return {
        id: String(account.account),
        name: account.account === 0 ? 'Main Account' : `Sub-Account #${account.account}`,
        addressView,
        assets: account.balances
          .map((balance: BalancesResponse) => {
            const valueView = getBalanceView.optional(balance);
            const metadata = getMetadataFromBalancesResponse.optional(balance);

            if (!valueView || !metadata) {
              return null;
            }

            // Enhance the metadata using the centralized function
            const enhancedMetadata = centralEnhanceMetadata(metadata) ?? metadata;

            // Get the proper display exponent for this asset
            const displayExponent = getDisplayDenomExponent(enhancedMetadata);

            // Convert amount to display format with proper commas for large numbers
            const amount = valueView.valueView.value?.amount;
            const displayAmount = amount
              ? pnum(amount, displayExponent).toFormattedString({
                  commas: true,
                  decimals: 0, // Don't show decimals for whole numbers
                  trailingZeros: false,
                })
              : '0';

            // Use enhanced metadata for display
            const displayName = enhancedMetadata.name ?? enhancedMetadata.symbol;

            const asset: AssetData = {
              id: enhancedMetadata.penumbraAssetId?.inner.toString() ?? '',
              // Use proper display name for the asset
              name: displayName,
              symbol: enhancedMetadata.symbol,
              // Don't include the symbol in amount - the component will add it
              amount: displayAmount,
              value: null,
              // Use enhanced metadata images (centralEnhanceMetadata sets proper icons for UM/delUM)
              icon: enhancedMetadata.images[0]?.png ?? enhancedMetadata.images[0]?.svg ?? undefined,
            };

            return asset;
          })
          .filter((asset: AssetData | null): asset is AssetData => asset !== null),
      } as AccountData;
    });
  }, [balancesStore.balancesByAccount, balancesStore.loading]);

  return (
    <div className='flex w-full flex-col items-center'>
      <div className='grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <AssetCard accounts={accounts} showInfoButton={true} />
        </div>
        <div>
          <TransactionCard />
        </div>
      </div>
    </div>
  );
});
