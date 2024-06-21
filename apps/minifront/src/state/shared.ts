import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import { SliceCreator, useStore } from '.';
import { getStakingTokenMetadata } from '../fetchers/registry';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getBalances } from '../fetchers/balances';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAllAssets } from '../fetchers/assets';

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
