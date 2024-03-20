import {
  Address,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { getBalances } from '.';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAddress, getAddressIndex } from '@penumbra-zone/getters/src/address-view';

export interface BalancesByAccount {
  index: number;
  address: Address;
  balances: BalancesResponse[];
}

const groupByAccount = (acc: BalancesByAccount[], curr: BalancesResponse): BalancesByAccount[] => {
  const index = getAddressIndex(curr.accountAddress);
  const grouping = acc.find(a => a.index === index.account);

  if (grouping) {
    grouping.balances.push(curr);
  } else {
    acc.push({
      index: index.account,
      address: getAddress(curr.accountAddress),
      balances: [curr],
    });
  }

  return acc;
};

export const getBalancesByAccount = async (): Promise<BalancesByAccount[]> => {
  const balances = await getBalances();
  return balances.reduce(groupByAccount, []);
};
