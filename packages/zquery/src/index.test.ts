import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createZQuery } from '.';
import { MOCK_PUPPY_PHOTOS, PuppyPhoto, State } from './test/mock-state';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { ZQuery } from './types';

describe('createZQuery()', () => {
  let zQuery: ZQuery<'puppyPhotos', PuppyPhoto[], []>;
  let useStore: UseBoundStore<StoreApi<State>>;
  const fetch = vi.fn().mockResolvedValue(MOCK_PUPPY_PHOTOS);

  beforeEach(() => {
    fetch.mockClear();

    zQuery = createZQuery({
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
    });

    const { puppyPhotos } = zQuery;

    useStore = create<State>()(() => ({
      puppyPhotos,
    }));
  });

  describe('the return value', () => {
    it('includes hooks and a Zustand slice that use the passed-in name', () => {
      expect(zQuery).toHaveProperty('puppyPhotos');
      expect(zQuery.usePuppyPhotos).toBeTypeOf('function');
      expect(zQuery.useRevalidatePuppyPhotos).toBeTypeOf('function');
    });

    describe('the ZQuery slice', () => {
      it('has the correct default state', () => {
        expect(zQuery.puppyPhotos).toEqual({
          data: undefined,
          error: undefined,
          loading: false,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          revalidate: expect.any(Function),
          _zQueryInternal: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            fetch: expect.any(Function),
            referenceCount: 0,
          },
        });
      });
    });
  });
});
