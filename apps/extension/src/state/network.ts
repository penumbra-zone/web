import { ExtensionStorage, LocalStorageState } from 'penumbra-storage';
import { AllSlices, SliceCreator } from './index';

export interface NetworkSlice {
  grpcEndpoint: string | undefined;
  lastBlockSynced: number;
  setGRPCEndpoint: (endpoint: string) => Promise<void>;
}

export const createNetworkSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<NetworkSlice> =>
  set => {
    return {
      grpcEndpoint: undefined,
      lastBlockSynced: 0,
      setGRPCEndpoint: async (endpoint: string) => {
        set(state => {
          state.network.grpcEndpoint = endpoint;
        });

        await local.set('grpcEndpoint', endpoint);
      },
    };
  };

export const networkSelector = (state: AllSlices) => state.network;
