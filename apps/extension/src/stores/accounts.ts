import { SliceCreator } from './index';

export interface BearSlice {
  bears: number;
  addBear: () => void;
}

export const createBearSlice: SliceCreator<BearSlice> = (set) => ({
  bears: 0,
  addBear: () => {
    set((state) => {
      return {
        bears: state.bears + 1,
      };
    });
  },
});

export interface FishSlice {
  fishes: number;
  addFish: () => void;
}

export const createFishSlice: SliceCreator<FishSlice> = (set) => ({
  fishes: 0,
  addFish: () => {
    set((state) => ({ fishes: state.fishes + 1 }));
  },
});
