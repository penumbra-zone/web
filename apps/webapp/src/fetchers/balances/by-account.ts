import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { AssetBalance, getAssetBalances } from '.';

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
