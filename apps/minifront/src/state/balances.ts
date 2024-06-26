import { SliceCreator, useStore } from '.';
import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import { BalancesByAccount, getBalancesByAccount } from '../fetchers/balances/by-account';

export const { balancesByAccount, useBalancesByAccount } = createZQuery({
  name: 'balancesByAccount',
  fetch: getBalancesByAccount,
  getUseStore: () => useStore,
  get: state => state.balances.balancesByAccount,
  set: setter => {
    const newState = setter(useStore.getState().balances.balancesByAccount);
    useStore.setState(state => {
      state.balances.balancesByAccount = newState;
    });
  },
});

export interface BalancesSlice {
  balancesByAccount: ZQueryState<BalancesByAccount[]>;
}

export const createBalancesSlice = (): SliceCreator<BalancesSlice> => () => ({
  balancesByAccount,
});
