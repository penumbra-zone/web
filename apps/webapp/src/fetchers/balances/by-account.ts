import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { AssetBalance, getAssetBalances } from '.';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getAddressIndex } from '@penumbra-zone/types';

export interface BalancesByAccount {
  index: AddressIndex;
  address: Address;
  balances: AssetBalance[];
}

const groupByAccount = (acc: BalancesByAccount[], curr: AssetBalance): BalancesByAccount[] => {
  if (curr.address.addressView.case !== 'decoded') throw new Error('address is not decoded');
  if (!curr.address.addressView.value.address) throw new Error('no address in address view');
  if (!curr.address.addressView.value.index) throw new Error('no index in address view');

  const index = curr.address.addressView.value.index;
  const grouping = acc.find(a => a.index.equals(index));

  if (grouping) {
    grouping.balances.push(curr);
  } else {
    acc.push({
      index,
      address: curr.address.addressView.value.address,
      balances: [curr],
    });
  }

  return acc;
};

export const getBalancesByAccount = async (): Promise<BalancesByAccount[]> => {
  const balances = await getAssetBalances();
  return balances.reduce(groupByAccount, []);
};

const groupByAccountIndex = (
  acc: Map<number, ValueView[]>,
  curr: AssetBalance,
): Map<number, ValueView[]> => {
  if (curr.address.addressView.case !== 'decoded') throw new Error('address is not decoded');
  if (!curr.address.addressView.value.address) throw new Error('no address in address view');
  if (!curr.address.addressView.value.index) throw new Error('no index in address view');

  const index = getAddressIndex(curr.address);
  const grouping = acc.get(index.account);

  if (grouping) {
    grouping.push(curr.value);
  } else {
    acc.set(index.account, [curr.value]);
  }

  return acc;
};

export const getBalancesByAccountIndex = async (): Promise<Map<number, ValueView[]>> => {
  const balances = await getAssetBalances();
  return balances.reduce(groupByAccountIndex, new Map());
};
