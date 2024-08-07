import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import { SliceCreator, useStore } from '.';
import { getStakingTokenMetadata } from '../fetchers/registry';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { getBalances } from '../fetchers/balances';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { getAllAssets } from '../fetchers/assets';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { getAddress, getAddressIndex } from '@penumbra-zone/getters/address-view';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';

/**
 * For Noble specifically we need to use a Bech32 encoding rather than Bech32m,
 * because Noble currently has a middleware that decodes as Bech32.
 * Noble plans to change this at some point in the future but until then we need
 * to use a special encoding just for Noble specifically.
 */
export const bech32ChainIds = [
  'noble-1', // noble mainnet
  'grand-1', // noble testnet
];

export const { stakingTokenMetadata, useStakingTokenMetadata } = createZQuery({
  name: 'stakingTokenMetadata',
  fetch: getStakingTokenMetadata,
  getUseStore: () => useStore,
  get: state => state.shared.stakingTokenMetadata,
  set: setter => {
    const newState = setter(useStore.getState().shared.stakingTokenMetadata);
    useStore.setState(state => {
      state.shared.stakingTokenMetadata = newState;
    });
  },
});

export const { balancesResponses, useBalancesResponses } = createZQuery({
  name: 'balancesResponses',
  fetch: getBalances,
  getUseStore: () => useStore,
  get: state => state.shared.balancesResponses,
  set: setter => {
    const newState = setter(useStore.getState().shared.balancesResponses);
    useStore.setState(state => {
      state.shared.balancesResponses = newState;
    });
  },
});

export const { assets, useAssets } = createZQuery({
  name: 'assets',
  fetch: getAllAssets,
  getUseStore: () => useStore,
  get: state => state.shared.assets,
  set: setter => {
    const newState = setter(useStore.getState().shared.assets);
    useStore.setState(state => {
      state.shared.assets = newState;
    });
  },
});

export interface SharedSlice {
  assets: ZQueryState<Metadata[]>;
  balancesResponses: ZQueryState<BalancesResponse[]>;
  stakingTokenMetadata: ZQueryState<Metadata>;
}

export const createSharedSlice = (): SliceCreator<SharedSlice> => () => ({
  assets,
  balancesResponses,
  stakingTokenMetadata,
});

export interface BalancesByAccount {
  account: number;
  address: Address;
  balances: BalancesResponse[];
}

export const groupByAccount = (
  acc: BalancesByAccount[],
  curr: BalancesResponse,
): BalancesByAccount[] => {
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

export const balancesByAccountSelector = (
  zQueryState: AbridgedZQueryState<BalancesResponse[]>,
): BalancesByAccount[] => zQueryState.data?.reduce(groupByAccount, []) ?? [];
