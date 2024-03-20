import { AllSlices, SliceCreator } from '.';
import { getEphemeralAddress } from '../fetchers/address';

import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  Chain as PenumbraChain,
  getChainMetadataById,
  getChainMetadataByName,
} from '@penumbra-zone/constants/src/chains';
import {
  CosmosChain,
  getCosmosChainById,
  getCosmosChainByName,
} from '@penumbra-zone/constants/src/cosmos';
import { PlainMessage, toPlainMessage } from '@bufbuild/protobuf';

export interface IbcSlice {
  txInProgress: boolean;
  assetBalances?: PlainMessage<BalancesResponse>[];
  penumbraChain?: PenumbraChain;
  cosmosChain?: CosmosChain;
  setChainByName: (chainName: string) => void;
  setChainById: (chainId: string) => void;
  penumbra: {
    account: number;
    address: PlainMessage<Address>;
    unshield?: PlainMessage<BalancesResponse>;
    setAccount: (account: number) => Promise<void>;
    setUnshield: (send: BalancesResponse) => void;
  };
  cosmos: {
    customDestination?: string;
    setCustomDestination: (address: string) => void;
  };
}

export const createIbcSlice = (): SliceCreator<IbcSlice> => set => {
  return {
    txInProgress: false,
    setChainByName: (chainName: string) => {
      if (!chainName) return;
      set(state => {
        state.ibc.penumbraChain = getChainMetadataByName(chainName)!;
        state.ibc.cosmosChain = getCosmosChainByName(chainName)!;
      });
    },
    setChainById: (chainId: string) => {
      if (!chainId) return;
      set(state => {
        state.ibc.penumbraChain = getChainMetadataById(chainId)!;
        state.ibc.cosmosChain = getCosmosChainById(chainId)!;
      });
    },
    penumbra: {
      account: 0,
      address: toPlainMessage(new Address()),
      setAccount: async (account: number) => {
        const address = await getEphemeralAddress(account);
        set(state => {
          state.ibc.penumbra.account = account;
          state.ibc.penumbra.address = toPlainMessage(address);
        });
      },
      setUnshield: (unshield: BalancesResponse) => {
        set(state => {
          state.ibc.penumbra.unshield = toPlainMessage(unshield);
        });
      },
    },
    cosmos: {
      setCustomDestination: (address: string) => {
        set(state => {
          state.ibc.cosmos.customDestination = address;
        });
      },
    },
  };
};

export const ibcPenumbraSelector = (state: AllSlices) => state.ibc.penumbra;
export const ibcCosmosSelector = (state: AllSlices) => state.ibc.cosmos;
export const ibcSelector = (state: AllSlices) => state.ibc;
