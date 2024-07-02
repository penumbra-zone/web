import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { getBalances } from '.';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAddress, getAddressIndex } from '@penumbra-zone/getters/address-view';
import { sortByPriorityScore } from './by-priority-score';
import { shouldDisplay } from './should-display';
import { getAssetIds } from '../registry';

export interface BalancesByAccount {
  account: number;
  address: Address;
  balances: BalancesResponse[];
}

const groupByAccount = (acc: BalancesByAccount[], curr: BalancesResponse): BalancesByAccount[] => {
  const index = getAddressIndex(curr.accountAddress);
  const grouping = acc.find(a => a.account === index.account);

  if (grouping) {
    grouping.balances.push(curr);
  } else {
    acc.push({
      account: index.account,
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

export const getFilteredBalancesByAccount = async (): Promise<BalancesByAccount[]> => {
  const [balances, assetIds] = await Promise.all([getBalances(), getAssetIds()]);
  return balances
    .filter(shouldDisplay)
    .sort(sortByPriorityScore(assetIds))
    .reduce(groupByAccount, []);
};
