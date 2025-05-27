import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import {
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { pnum } from '@penumbra-zone/types/pnum';

import { useBalancesStore } from '@shared/stores/store-context';
import { BalancesByAccount } from '@shared/stores/balances-store';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AssetCard } from './assets/AssetCard';
import { TransactionCard } from './transactions/TransactionCard';

// Define interfaces for our implementation
interface AssetData {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: string | null;
  icon?: string;
}

interface AccountData {
  id: string;
  name: string;
  assets: AssetData[];
  addressView?: AddressView;
}

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

            // Get the proper display exponent for this asset
            const displayExponent = getDisplayDenomExponent(metadata);

            // Convert amount to display format with proper commas for large numbers
            const amount = valueView.valueView.value?.amount;
            const displayAmount = amount
              ? pnum(amount, displayExponent).toFormattedString({
                  commas: true,
                  decimals: 0, // Don't show decimals for whole numbers
                  trailingZeros: false,
                })
              : '0';

            // Get the proper metadata display values
            const symbol = metadata.symbol;

            // Use metadata.name for proper display name (like "TestUSD" or "Penumbra")
            // Fallback to symbol if name is not available
            const displayName = metadata.name || symbol;

            const asset: AssetData = {
              id: metadata.penumbraAssetId?.inner.toString() ?? '',
              // Use proper display name for the asset - typically metadata.name
              name: displayName,
              symbol,
              // Don't include the symbol in amount - the component will add it
              amount: displayAmount,
              value: null,
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string for icon path is valid and should not be coalesced to undefined, || is intentional here
              icon: metadata.images[0]?.png || metadata.images[0]?.svg || undefined,
            };

            return asset;
          })
          .filter((asset: AssetData | null): asset is AssetData => asset !== null),
      } as AccountData;
    });
  }, [balancesStore.balancesByAccount]);

  // For now we don't have actual value calculation
  // In a future implementation, we would calculate a real total balance value here

  return (
    <div className='flex w-full flex-col items-center'>
      {/* PortfolioBalance hidden until totalBalanceValue is implemented */}

      <div className='grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Asset Card with real data */}
        <div>
          <AssetCard accounts={accounts} showInfoButton={true} />
        </div>

        {/* Reserved space for Transactions, to be implemented later */}
        <div>
          <TransactionCard />
        </div>
      </div>
    </div>
  );
});
