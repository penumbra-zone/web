import { ExtensionStorage } from '@penumbra-zone/storage/src/chrome/base';
import { AllSlices, SliceCreator } from '.';
import { LocalStorageState } from '@penumbra-zone/types/src/local-storage';

export interface NetworkSlice {
  grpcEndpoint: string | undefined;
  fullSyncHeight: number;
  setGRPCEndpoint: (endpoint: string) => Promise<void>;
}

export const createNetworkSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<NetworkSlice> =>
  set => {
    return {
      grpcEndpoint: undefined,
      fullSyncHeight: 0,
      setGRPCEndpoint: async (endpoint: string) => {
        set(state => {
          state.network.grpcEndpoint = endpoint;
        });

        await local.set('grpcEndpoint', endpoint);
      },
    };
  };

export const networkSelector = (state: AllSlices) => state.network;
