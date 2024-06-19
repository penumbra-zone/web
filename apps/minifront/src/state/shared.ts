import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import { SliceCreator, useStore } from '.';
import { getStakingTokenMetadata } from '../fetchers/registry';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

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

export interface SharedSlice {
  stakingTokenMetadata: ZQueryState<Metadata>;
}

export const createSharedSlice = (): SliceCreator<SharedSlice> => () => ({
  stakingTokenMetadata,
});
