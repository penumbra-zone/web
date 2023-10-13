import { useBalances } from './balances';
import { Base64Str, joinLoHi, uint8ArrayToBase64 } from 'penumbra-types';
import { useAssets } from './assets';
import {
  AssetsResponse,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { useMemo } from 'react';
import { AddrQueryReturn, useAddresses } from './address';

export interface AssetBalance {
  amount: number;
  usdcValue: number;
}

interface AssetWithBalance {
  assetId: Base64Str;
  account: { index: number; address: string };
  balance: AssetBalance;
  denomMetadata: Pick<DenomMetadata, 'display'>;
}

type AssetWithIndexOnly = Omit<AssetWithBalance, 'denomMetadata' | 'account'> & {
  account: { index: number };
};

const normalize = (res: BalancesResponse): AssetWithIndexOnly => {
  const amount = Number(joinLoHi(res.balance?.amount?.lo ?? 0n, res.balance?.amount?.hi ?? 0n));
  return {
    assetId: uint8ArrayToBase64(res.balance!.assetId!.inner),
    account: { index: res.account?.account ?? 0 },
    balance: {
      amount,
      usdcValue: amount * 0.1, // TODO: Get from above
    },
  };
};

const addAddress =
  (addrRes: AddrQueryReturn[] | undefined) =>
  (a: AssetWithIndexOnly): Omit<AssetWithBalance, 'denomMetadata'> => {
    const match = addrRes?.find(res => res.index === a.account.index);

    if (match) {
      return { ...a, account: { index: a.account.index, address: match.address } };
    } else {
      return { ...a, account: { index: a.account.index, address: '' } };
    }
  };

const addMetadata =
  (metadata: AssetsResponse[]) =>
  (balance: Omit<AssetWithBalance, 'denomMetadata'>): AssetWithBalance => {
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
    // Sort first by account (lowest first)
    if (a.account !== b.account) return a.account.index - b.account.index;

    // Next, sort by asset value/amount in descending order (largest to smallest).
    if (a.balance[sortBy] !== b.balance[sortBy]) return b.balance[sortBy] - a.balance[sortBy];

    // If balances are equal, sort by asset name in ascending order
    return a.denomMetadata.display.localeCompare(b.denomMetadata.display);
  };

interface SortedAssetsReturnVal {
  data: AssetWithBalance[];
  error: unknown;
}

// TODO: Are there react-specific optimizations missing here?
export const useBalancesWithMetadata = (
  sortBy: keyof AssetBalance,
  search?: string,
): SortedAssetsReturnVal => {
  const { data: balances, error: bError } = useBalances();

  const accounts = useMemo(() => {
    return balances.map(b => ({ account: b.account?.account }));
  }, [balances]);

  const { data: accountAddrs, error: acError } = useAddresses(accounts);
  const { data: assets, error: asError } = useAssets();
  // TODO: Enable when CORS server issue on testnet
  // const { data, error } = useUsdcValues(props);

  const data = useMemo(
    () =>
      balances
        .map(normalize)
        .map(addAddress(accountAddrs))
        .map(addMetadata(assets))
        .sort(sortComparator(sortBy))
        .filter(a => {
          if (!search) return true;
          return a.denomMetadata.display.includes(search.toLowerCase());
        }),
    [accountAddrs, assets, balances, search, sortBy],
  );

  return { data, error: bError ?? asError ?? acError };
};
