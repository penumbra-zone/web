import {
  AssetsResponse,
  BalancesRequest,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import {
  AssetId,
  DenomUnit,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { getAddresses, IndexAddrRecord } from './address';
import { getAllAssets } from './assets';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { addAmounts, joinLoHiAmount, uint8ArrayToBase64 } from '@penumbra-zone/types';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { viewClient } from '../clients/grpc';
import { streamToPromise } from './stream';

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

// Accumulates totals per asset across accounts
export const groupByAsset = (balances: AssetBalance[], curr: AssetBalance): AssetBalance[] => {
  const match = balances.find(b => b.assetId.equals(curr.assetId));
  if (match) {
    match.amount = addAmounts(match.amount, curr.amount);
  } else {
    balances.push({ ...curr });
  }
  return balances;
};

interface BalancesProps {
  accountFilter?: AddressIndex;
  assetIdFilter?: AssetId;
}

export const getBalances = ({ accountFilter, assetIdFilter }: BalancesProps = {}) => {
  const req = new BalancesRequest();
  if (accountFilter) req.accountFilter = accountFilter;
  if (assetIdFilter) req.assetIdFilter = assetIdFilter;

  const iterable = viewClient.balances(req);
  return streamToPromise(iterable);
};

const getBalancesWithMetadata = async (): Promise<NormalizedBalance[]> => {
  const balances = await getBalances();
  const accounts = [...new Set(balances.map(b => b.account?.account))];
  const accountAddrs = await getAddresses(accounts);
  const assets = await getAllAssets();
  return balances.map(normalize(assets, accountAddrs));
};

// TODO: When simulation endpoint is supported, add pricing data here
export const getBalancesByAccount = async (): Promise<AccountBalance[]> => {
  const balances = await getBalancesWithMetadata();
  const grouped = balances.reduce<AccountBalance[]>(groupByAccount, []);
  grouped.sort(sortByAccount);
  return grouped;
};

export const getBalancesByAccountIndex = async (accountIndex?: number): Promise<AssetBalance[]> => {
  const balances = await getBalancesByAccount();
  return balances
    .filter(a => !accountIndex || a.index === accountIndex)
    .flatMap(a => a.balances)
    .reduce<AssetBalance[]>(groupByAsset, []);
};
