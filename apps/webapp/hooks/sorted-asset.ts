import { useBalances } from './balances';
import { Base64Str, joinLoHi, uint8ArrayToBase64 } from 'penumbra-types';
import { useAssets } from './assets';
import {
  AssetsResponse,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { useMemo } from 'react';
import { useUsdcValues } from './simulate';

export interface AssetBalance {
  amount: number;
  usdcValue: number;
}

interface AssetWithBalance {
  assetId: Base64Str;
  account: number;
  balance: AssetBalance;
  denomMetadata: Pick<DenomMetadata, 'display'>;
}

type AssetNoMetadata = Omit<AssetWithBalance, 'denomMetadata'>;

interface UseAddValueReturn {
  data: AssetNoMetadata[];
  error: string | undefined;
}

const useAddValues = (responses: BalancesResponse[]): UseAddValueReturn => {
  const props = responses.map(b => ({
    inputAsset: uint8ArrayToBase64(b.balance!.assetId!.inner),
    amount: Number(joinLoHi(b.balance?.amount?.lo ?? 0n, b.balance?.amount?.hi ?? 0n)),
  }));

  const { data, error } = useUsdcValues(props);

  console.log(data, error);
  // if (data) {
  // data.map();
  // }
  const normalized = responses.map(res => {
    const amount = Number(joinLoHi(res.balance?.amount?.lo ?? 0n, res.balance?.amount?.hi ?? 0n));
    return {
      assetId: uint8ArrayToBase64(res.balance!.assetId!.inner),
      account: res.account?.account ?? 0,
      balance: {
        amount,
        usdcValue: amount * 0.1, // TODO: Should properly fetch price data
      },
    };
  });

  return { data: normalized, error: error ? String(error) : undefined };
};

const addMetadata = (balance: AssetNoMetadata, metadata: AssetsResponse[]): AssetWithBalance => {
  const match = metadata.find(m => {
    if (!m.denomMetadata?.penumbraAssetId?.inner) return false;
    return balance.assetId === uint8ArrayToBase64(m.denomMetadata.penumbraAssetId.inner);
  });

  if (!match) {
    return { ...balance, denomMetadata: { display: 'unknown' } };
  } else {
    return { ...balance, denomMetadata: match.denomMetadata! };
  }
};

const sortComparator =
  (sortBy: keyof AssetBalance) =>
  (a: AssetWithBalance, b: AssetWithBalance): number => {
    // Sort by  in descending order (largest to smallest).
    if (a.balance[sortBy] !== b.balance[sortBy]) return b.balance[sortBy] - a.balance[sortBy];

    // If balances are equal, sort by asset name in ascending order
    return a.denomMetadata.display.localeCompare(b.denomMetadata.display);
  };

interface SortedAssetsReturnVal {
  data: AssetWithBalance[];
  error: string | undefined;
}

export const useBalancesWithMetadata = (
  sortBy: keyof AssetBalance,
  search?: string,
): SortedAssetsReturnVal => {
  const { data: balances, error: bError } = useBalances();
  const { data: assets } = useAssets();

  const { data: withValues, error: vError } = useAddValues(balances);

  const data = useMemo(
    () =>
      withValues
        .map(b => addMetadata(b, assets))
        .sort(sortComparator(sortBy))
        .filter(a => {
          if (!search) return true;
          return a.denomMetadata.display.includes(search.toLowerCase());
        }),
    [assets, search, sortBy, withValues],
  );

  return { data, error: bError ?? vError };
};
