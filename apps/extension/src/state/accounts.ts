import { SliceCreator } from './index';

export interface FishSlice {
  fishes: number;
  salmon: number;
  addFish: () => void;
  addSalmon: () => void;
}

export interface BearSlice {
  bears: number;
  groupName: string | undefined;
  addBear: () => void;
}

export const createBearSlice: SliceCreator<BearSlice> = (set) => ({
  bears: 0,
  groupName: undefined,
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
  salmon: number;
  addFish: () => void;
  addSalmon: () => void;
}

export const createFishSlice: SliceCreator<FishSlice> = (set) => ({
  fishes: 0,
  salmon: 0,
  addFish: () => {
    set((state) => ({ fishes: state.fishes + 1 }));
  },
  addSalmon: () => {
    set((state) => ({ salmon: state.salmon + 1 }));
  },
});
