import { Asset, assets } from 'penumbra-constants';
import { useBalances } from './balances';
import { useMemo } from 'react';
import { uint8ArrayToBase64 } from 'penumbra-types';
import { calculateBalance } from '../utils';

export interface AssetBalances {
  balance: number;
  usdcValue: number;
}

export type AssetWithBalances = Asset & AssetBalances;

export const useSortedAssets = (
  sortBy: 'balance' | 'usdcValue',
  search?: string,
): AssetWithBalances[] => {
  const { data, end, error } = useBalances(0);

  const sortedAssets: AssetWithBalances[] = useMemo(() => {
    // if stream in progress or error show asset list with zero balance
    if (!end || error)
      return [...assets].map(asset => ({
        ...asset,
        balance: 0,
        usdcValue: 0,
      }));

    const assetCalculateBalance = [...assets].map(asset => {
      // find same asset from balances and asset list
      const equalAsset = data.find(
        bal =>
          bal.balance?.assetId?.inner &&
          uint8ArrayToBase64(bal.balance.assetId.inner) === asset.penumbraAssetId.inner,
      );

      //initial balance is 0
      let balance = 0;
      let usdcValue = 0;

      if (equalAsset) {
        // if find same asset then calculate balance
        const loHi = {
          lo: equalAsset.balance?.amount?.lo ?? 0n,
          hi: equalAsset.balance?.amount?.hi ?? 0n,
        };

        const assetBalance = calculateBalance(loHi, asset);
        const price = 0.1;
        balance = assetBalance;
        usdcValue = assetBalance * price;
      }

      return { ...asset, balance, usdcValue };
    });

    const sortedAsset = [...assetCalculateBalance].sort((a, b) => {
      // Sort by  in descending order (largest to smallest).
      if (a[sortBy] !== b[sortBy]) return b[sortBy] - a[sortBy];

      // If balances are equal, sort by asset name in ascending order
      return a.name.localeCompare(b.display);
    });

    // If no search query is provided, return the sorted assets directly.
    if (!search) return sortedAsset;

    // Filter the sorted assets based on a case-insensitive search query.
    return sortedAsset.filter(asset => asset.display.toLowerCase().includes(search.toLowerCase()));
  }, [search, data, end, error, sortBy]);

  return sortedAssets;
};
