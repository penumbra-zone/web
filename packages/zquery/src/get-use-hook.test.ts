import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { ZQueryState } from './types';
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

describe('`use[Name]()` hook', () => {
  let puppyPhotos: ZQueryState<PuppyPhoto[]>;
  let usePuppyPhotos: () => {
    data?: PuppyPhoto[] | undefined;
    loading: boolean;
    error?: unknown;
  };

  let useStore: UseBoundStore<StoreApi<State>>;

  beforeEach(() => {
    ({ puppyPhotos, usePuppyPhotos } = createZQuery({
      name: 'puppyPhotos',
      fetch: () => Promise.resolve(MOCK_PUPPY_PHOTOS),
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

  describe('the returned hook', () => {
    it('returns an object with `data`/`loading`/`error` properties', () => {
      const { result } = renderHook(usePuppyPhotos);

      expect(result.current).toEqual({
        data: undefined,
        loading: false,
        error: undefined,
      });
    });
  });
});
