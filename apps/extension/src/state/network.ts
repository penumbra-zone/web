import { AllSlices, SliceCreator } from './index';
import { testnetConstants } from 'penumbra-constants';

export interface NetworkSlice {
  grpcEndpoint: string | undefined;
  lastBlockSynced: number;
}

// TODO: When network toggle created, should add setters to this.
//       grpcEndpoint should sync to chrome.storage.local
export const createNetworkSlice: SliceCreator<NetworkSlice> = () => {
  return {
    grpcEndpoint: testnetConstants.grpcEndpoint,
    lastBlockSynced: 0,
  };
};

export const networkSelector = (state: AllSlices) => state.network;
