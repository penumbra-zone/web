import { SliceCreator } from './index';

export interface NetworkSlice {
  grpcEndpoint: string | undefined;
}

// TODO: When network toggle created, should add setters to this.
//       grpcEndpoint should sync to chrome.storage.local
export const createNetworkSlice: SliceCreator<NetworkSlice> = () => {
  return {
    grpcEndpoint: undefined,
  };
};
