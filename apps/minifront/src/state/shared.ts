import { getAddress, getAddressIndex } from '@penumbra-zone/getters/address-view';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import {
  BalancesResponse,
  BalancesResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { SliceCreator, useStore } from '.';
import { getStakingTokenMetadata } from '../fetchers/registry';
import { getBalancesStream } from '../fetchers/balances';
import { getAllAssets } from '../fetchers/assets';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { GasPrices } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { getGasPrices } from '../fetchers/gas-prices';
import { toBinary } from '@bufbuild/protobuf';

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

const getHash = (bal: BalancesResponse) => uint8ArrayToHex(toBinary(BalancesResponseSchema, bal));

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

export const { gasPrices, useGasPrices } = createZQuery({
  name: 'gasPrices',
  fetch: getGasPrices,
  getUseStore: () => useStore,
  get: state => state.shared.gasPrices,
  set: setter => {
    const newState = setter(useStore.getState().shared.gasPrices);
    useStore.setState(state => {
      state.shared.gasPrices = newState;
    });
  },
});

export interface SharedSlice {
  assets: ZQueryState<Metadata[]>;
  balancesResponses: ZQueryState<BalancesResponse[], Parameters<typeof getBalancesStream>>;
  stakingTokenMetadata: ZQueryState<Metadata>;
  gasPrices: ZQueryState<GasPrices[]>;
}

export const createSharedSlice = (): SliceCreator<SharedSlice> => () => ({
  assets,
  balancesResponses,
  stakingTokenMetadata,
  gasPrices,
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
