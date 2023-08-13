import { SliceCreator } from './index';

export interface NetworkSlice {
  type: string | undefined;
}

// Filler to test two slices. Replace when next slice created.
export const createNetworkSlice: SliceCreator<NetworkSlice> = () => {
  return {
    type: undefined,
  };
};
