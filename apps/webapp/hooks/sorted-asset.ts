import { useBalances } from './balances';
import { joinLoHiAmount, uint8ArrayToBase64 } from '@penumbra-zone/types';
import { useAssets } from './assets';
import {
  AssetsResponse,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { useMemo } from 'react';
import { IndexAddrRecord, useAddresses } from './address';
import {
  AssetId,
  DenomUnit,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';

export interface AssetBalance {
  denom: {
    display: DenomUnit['denom'];
    exponent: DenomUnit['exponent'];
  };
  assetId: AssetId;
  amount: Amount;
  usdcValue: number;
}

export interface AccountBalance {
  index: number;
  address: string;
  balances: AssetBalance[];
}

type NormalizedBalance = AssetBalance & {
  account: { index: number; address: string };
};

// Given an asset has many denom units, the amount should be formatted using
// the exponent of the display denom (e.g. 1,954,000,000 upenumbra = 1,954 penumbra)
export const displayDenom = (res?: AssetsResponse): { display: string; exponent: number } => {
  const display = res?.denomMetadata?.display;
  if (!display) return { display: 'unknown', exponent: 0 };

  const match = res.denomMetadata?.denomUnits.find(d => d.denom === display);
  if (!match) return { display, exponent: 0 };

  return { display, exponent: match.exponent };
};

const getDenomAmount = (res: BalancesResponse, metadata: AssetsResponse[]) => {
  const assetId = uint8ArrayToBase64(res.balance!.assetId!.inner);
  const match = metadata.find(m => {
    if (!m.denomMetadata?.penumbraAssetId?.inner) return false;
    return assetId === uint8ArrayToBase64(m.denomMetadata.penumbraAssetId.inner);
  });

  const { display, exponent } = displayDenom(match);
  const amount = res.balance?.amount ?? new Amount();

  return { display, exponent, amount };
};

const normalize =
  (metadata: AssetsResponse[], indexAddrRecord: IndexAddrRecord | undefined) =>
  (res: BalancesResponse): NormalizedBalance => {
    const index = res.account?.account ?? 0;
    const address = indexAddrRecord?.[index] ?? '';

    const { display, exponent, amount } = getDenomAmount(res, metadata);

    return {
      denom: { display, exponent },
      assetId: res.balance!.assetId!,
      amount,
      //usdcValue: amount * 0.93245, // TODO: Temporary until pricing implemented
      usdcValue: 0, // Important not to imply that testnet balances have any value
      account: { index, address },
    };
  };

const groupByAccount = (balances: AccountBalance[], curr: NormalizedBalance): AccountBalance[] => {
  const match = balances.find(b => b.index === curr.account.index);
  const newBalance = {
    denom: curr.denom,
    amount: curr.amount,
    usdcValue: curr.usdcValue,
    assetId: curr.assetId,
  } satisfies AssetBalance;

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

  // If values are equal, sort by amount descending
  if (!a.amount.equals(b.amount))
    return Number(joinLoHiAmount(b.amount) - joinLoHiAmount(a.amount));

  // If both are equal, sort by asset name in ascending order
  return a.denom.display.localeCompare(b.denom.display);
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
