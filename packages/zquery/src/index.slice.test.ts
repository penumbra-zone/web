import { beforeEach, describe, vi } from 'vitest';
import { ZQueryState } from './types';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { createZQuery } from '.';

interface PuppyPhoto {
  id: string;
  name: string;
  url: string;
}

const MOCK_PUPPY_PHOTOS: PuppyPhoto[] = [
  {
    id: 'a',
    name: 'Croissant',
    url: 'croissant.jpg',
  },
  {
    id: 'b',
    name: 'Rocket',
    url: 'rocket.jpg',
  },
  {
    id: 'c',
    name: 'Cookie',
    url: 'cookie.jpg',
  },
];

interface State {
  puppyPhotos: ZQueryState<PuppyPhoto[]>;
}

describe('the ZQuery slice', () => {
  let puppyPhotos: ZQueryState<PuppyPhoto[]>;
  let usePuppyPhotos: () => {
    data?: PuppyPhoto[] | undefined;
    loading: boolean;
    error?: unknown;
  };
  let useStore: UseBoundStore<StoreApi<State>>;
  const fetch = vi.fn().mockResolvedValue(MOCK_PUPPY_PHOTOS);

  beforeEach(() => {
    fetch.mockClear();

    ({ puppyPhotos, usePuppyPhotos } = createZQuery({
      name: 'puppyPhotos',
      fetch,
      getUseStore: () => useStore,
      get: state => state.puppyPhotos,
      set: setter => {
        const newState = setter(useStore.getState().puppyPhotos);
        useStore.setState(state => ({
          ...state,
          puppyPhotos: newState,
        }));
      },
    }));

    useStore = create<State>()(() => ({
      puppyPhotos,
    }));
  });
});
