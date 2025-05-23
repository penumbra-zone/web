import { Card } from '@penumbra-zone/ui';
import { AssetCard } from './assets/AssetCard';
import {
  BalancesByAccount,
  balancesByAccountSelector,
  useBalancesResponses,
} from '../../../state/shared';
import { useMemo } from 'react';
import {
  getBalanceView,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { shouldDisplay } from '../../../fetchers/balances/should-display';
import { sortByPriorityScore } from '../../../fetchers/balances/by-priority-score';
import { pnum } from '@penumbra-zone/types/pnum';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

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

export const Portfolio = () => {
  // Fetch real data from Prax client
  const balancesByAccount = useBalancesResponses({
    select: (state: AbridgedZQueryState<BalancesResponse[]>) => {
      if (!state.data) {
        return [];
      }

      return state.data
        .filter(shouldDisplay)
        .sort(sortByPriorityScore)
        .reduce((acc: BalancesByAccount[], curr: BalancesResponse) => {
          // Group balances by account
          const accounts = balancesByAccountSelector({
            data: [curr],
            loading: false,
            error: null,
          });

          if (!accounts.length) {
            return acc;
          }

          const account = accounts[0];
          if (!account) {
            return acc;
          }

          const existingAccount = acc.find(a => a.account === account.account);

          if (existingAccount) {
            existingAccount.balances.push(...account.balances);
          } else {
            acc.push(account);
          }

          return acc;
        }, []);
    },
  });

  // Transform balances data to format expected by AssetCard
  const accounts = useMemo(() => {
    if (!balancesByAccount) {
      return [];
    }

    return balancesByAccount.map(account => {
      // The addressView should be the AddressView protobuf message itself
      const firstBalance = account.balances[0];
      const addressView = firstBalance?.accountAddress;

      return {
        id: String(account.account),
        name: account.account === 0 ? 'Main Account' : `Sub-Account #${account.account}`,
        addressView,
        assets: account.balances
          .map(balance => {
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
          .filter((asset): asset is AssetData => asset !== null),
      } as AccountData;
    });
  }, [balancesByAccount]);

  // For now we don't have actual value calculation
  // In a future implementation, we would calculate a real total balance value here

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* PortfolioBalance hidden until totalBalanceValue is implemented */}

      <div className='flex w-full flex-1 flex-col gap-4 md:flex-row'>
        {/* Asset Card with real data */}
        <div className='flex-1'>
          <AssetCard accounts={accounts} showInfoButton={true} />
        </div>

        {/* Reserved space for Transactions, to be implemented later */}
        <div className='flex-1'>
          <Card title='Your Recent Transactions'>
            <div className='flex h-[400px] items-center justify-center text-text-secondary'>
              Transactions will be displayed here
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
