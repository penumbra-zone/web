import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import { SliceCreator, useStore } from '.';
import { getStakingTokenMetadata } from '../fetchers/registry';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { getBalancesStream } from '../fetchers/balances';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { getAllAssets } from '../fetchers/assets';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { getAddress, getAddressIndex } from '@penumbra-zone/getters/address-view';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

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

const getHash = (bal: BalancesResponse) => uint8ArrayToHex(bal.toBinary());

export const { balancesResponses, useBalancesResponses } = createZQuery({
  name: 'balancesResponses',
  fetch: getBalancesStream,
  stream: () => {
    const balanceResponseIdsToKeep = new Set<string>();

    return {
      onValue: (
        prevState: BalancesResponse[] | undefined = [],
        balanceResponse: BalancesResponse,
      ) => {
        balanceResponseIdsToKeep.add(getHash(balanceResponse));

        const existingIndex = prevState.findIndex(bal => getHash(bal) === getHash(balanceResponse));

        // Update any existing items in place, rather than appending
        // duplicates.
        if (existingIndex >= 0) {
          return prevState.toSpliced(existingIndex, 1, balanceResponse);
        } else {
          return [...prevState, balanceResponse];
        }
      },

      onEnd: (prevState = []) =>
        // Discard any balances from a previous stream.
        prevState.filter(balanceResponse => balanceResponseIdsToKeep.has(getHash(balanceResponse))),
    };
  },
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
  balancesResponses: ZQueryState<BalancesResponse[], Parameters<typeof getBalancesStream>>;
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
