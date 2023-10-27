import { useBalances } from './balances';
import { displayAmount, joinLoHi, uint8ArrayToBase64 } from '@penumbra-zone/types';
import { useAssets } from './assets';
import {
  AssetsResponse,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { useMemo } from 'react';
import { IndexAddrRecord, useAddresses } from './address';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export interface AssetBalance {
  denom: string;
  assetId: AssetId;
  amount: number;
  usdcValue: number;
}

export interface AccountBalance {
  index: number;
  address: string;
  balances: AssetBalance[];
}

interface NormalizedBalance {
  denom: string;
  assetId: AssetId;
  amount: number;
  usdcValue: number;
  account: { index: number; address: string };
}

function getDenomAmount(res: BalancesResponse, metadata: AssetsResponse[]) {
  const assetId = uint8ArrayToBase64(res.balance!.assetId!.inner);
  const match = metadata.find(m => {
    if (!m.denomMetadata?.penumbraAssetId?.inner) return false;
    return assetId === uint8ArrayToBase64(m.denomMetadata.penumbraAssetId.inner);
  });
  const denom = match ? match.denomMetadata!.display : 'unknown';

  // May need to adjust the amount depending on the display exponents
  const baseAmount = Number(joinLoHi(res.balance?.amount?.lo ?? 0n, res.balance?.amount?.hi ?? 0n));
  const adjustedAmount = match ? displayAmount(match, baseAmount) : baseAmount;

  return { denom, amount: adjustedAmount };
}

const normalize =
  (metadata: AssetsResponse[], indexAddrRecord: IndexAddrRecord | undefined) =>
  (res: BalancesResponse): NormalizedBalance => {
    const index = res.account?.account ?? 0;
    const address = indexAddrRecord?.[index] ?? '';

    const { denom, amount } = getDenomAmount(res, metadata);

    return {
      denom,
      assetId: res.balance!.assetId!,
      amount: amount,
      usdcValue: amount * 0.93245, // TODO: Temporary until pricing implemented
      account: { index, address },
    };
  };

const groupByAccount = (balances: AccountBalance[], curr: NormalizedBalance): AccountBalance[] => {
  const match = balances.find(b => b.index === curr.account.index);
  const newBalance = {
    amount: curr.amount,
    denom: curr.denom,
    usdcValue: curr.usdcValue,
    assetId: curr.assetId,
  };
  if (match) {
    match.balances.push(newBalance);
    match.balances.sort(sortByAmount);
  } else {
    balances.push({
      address: curr.account.address,
      index: curr.account.index,
      balances: [newBalance],
    });
  }
  return balances;
};

const sortByAmount = (a: AssetBalance, b: AssetBalance): number => {
  // First, sort by asset value in descending order (largest to smallest).
  if (a.usdcValue !== b.usdcValue) return b.usdcValue - a.usdcValue;

  // If values are equal, sort by asset name in ascending order
  return a.denom.localeCompare(b.denom);
};

// Sort by account (lowest first)
const sortByAccount = (a: AccountBalance, b: AccountBalance): number => a.index - b.index;

interface UseBalancesReturnVal {
  data: AccountBalance[];
  error: unknown;
}

export const useBalancesWithMetadata = (): UseBalancesReturnVal => {
  const { data: balances, error: bError } = useBalances();

  const accounts = useMemo(() => {
    const allAccounts = balances.map(b => b.account?.account);
    return [...new Set(allAccounts)];
  }, [balances]);

  const { data: accountAddrs, error: acError } = useAddresses(accounts);
  const { data: assets, error: asError } = useAssets();

  // TODO: Use when simulation endpoint supported
  // const { data, error } = useUsdcValues(props);

  const data = useMemo(
    () =>
      balances
        .map(normalize(assets, accountAddrs))
        .reduce<AccountBalance[]>(groupByAccount, [])
        .toSorted(sortByAccount),
    [accountAddrs, assets, balances],
  );

  return { data, error: bError ?? asError ?? acError };
};
