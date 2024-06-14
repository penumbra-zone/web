import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZQueryState, createZQuery } from '.';
import { MOCK_PUPPY_PHOTOS, PuppyPhoto, State } from './test/mock-state';
import { StoreApi, UseBoundStore, create } from 'zustand';

describe('createZQuery()', () => {
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

  describe('the return value', () => {
    const result = createZQuery({
      name: 'puppyPhotos',
      fetch: () => Promise.resolve(null),
      getUseStore: () => useStore,
      set: () => {
        /* no-op */
      },
      get: () => ({
        _zQueryInternal: {
          fetch: vi.fn(),
          referenceCount: 0,
        },
        loading: false,
        revalidate: vi.fn(),
        data: undefined,
        error: undefined,
      }),
    });

    it('includes hooks and a Zustand slice that use the passed-in name', () => {
      expect(result).toHaveProperty('puppyPhotos');
      expect(result.usePuppyPhotos).toBeTypeOf('function');
      expect(result.useRevalidatePuppyPhotos).toBeTypeOf('function');
    });

    describe('the ZQuery slice', () => {
      it('has the correct default state', () => {
        expect(result.puppyPhotos).toEqual({
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
