/**
 * This file contains tests for the `use[Name]()` hook.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { ZQueryState } from './types';
import { createZQuery } from '.';
import verifyNeverOccurs from './test/verify-never-occurs';

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

  it('returns an object with `data`/`loading`/`error` properties', () => {
    const { result } = renderHook(usePuppyPhotos);

    expect(result.current).toEqual({
      data: undefined,
      loading: true,
      error: undefined,
    });
  });

  it('calls fetch()', () => {
    renderHook(usePuppyPhotos);
    expect(fetch).toHaveBeenCalled();
  });

  it('re-renders with data once data has loaded', async () => {
    const { rerender, result } = renderHook(usePuppyPhotos);

    await waitFor(() => {
      rerender();
      expect(result.current).toEqual({
        data: MOCK_PUPPY_PHOTOS,
        loading: false,
        error: undefined,
      });
    });
  });

  describe('streaming responses', () => {
    /**
     * A "remote control" that we'll use to control the streaming of responses
     * in the mock fetch function.
     */
    let yieldRemoteControl: PromiseWithResolvers<void>;

    beforeEach(() => {
      fetch.mockReset();

      yieldRemoteControl = Promise.withResolvers<void>();

      fetch.mockImplementation(async function* () {
        for (const puppyPhoto of MOCK_PUPPY_PHOTOS) {
          await yieldRemoteControl.promise;
          yield puppyPhoto;

          yieldRemoteControl = Promise.withResolvers<void>();
        }
      });

      ({ puppyPhotos, usePuppyPhotos } = createZQuery({
        name: 'puppyPhotos',
        fetch,
        stream: () => ({
          onValue: (prevState: PuppyPhoto[] | undefined = [], value: PuppyPhoto) => [
            ...prevState,
            value,
          ],
        }),
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

    it('streams responses to state', async () => {
      const { rerender, result } = renderHook(usePuppyPhotos);

      expect(result.current.data).toBeUndefined();

      yieldRemoteControl.resolve();
      await waitFor(() => {
        rerender();
        expect(result.current.data?.length).toBe(1);
      });

      yieldRemoteControl.resolve();
      await waitFor(() => {
        rerender();
        expect(result.current.data?.length).toBe(2);
      });

      yieldRemoteControl.resolve();
      await waitFor(() => {
        rerender();
        expect(result.current.data?.length).toBe(3);
      });
    });

    it('stops streaming responses when the component using the hook unmounts', async () => {
      const { rerender, result, unmount } = renderHook(usePuppyPhotos);

      yieldRemoteControl.resolve();
      await waitFor(() => {
        rerender();
        expect(result.current.data?.length).toBe(1);
      });

      yieldRemoteControl.resolve();
      await waitFor(() => {
        rerender();
        expect(result.current.data?.length).toBe(2);
      });

      unmount();

      yieldRemoteControl.resolve();
      await verifyNeverOccurs(() => {
        // Can't use rerender(), since the component is unmounted. So we'll
        // check the store's value directly.
        expect(useStore.getState().puppyPhotos.data?.length).toBe(3);
      });
    });

    describe('when a second component uses the same hook', () => {
      it('keeps streaming responses when only one component using the hook unmounts', async () => {
        const component1 = renderHook(usePuppyPhotos);
        const component2 = renderHook(usePuppyPhotos);

        yieldRemoteControl.resolve();
        await waitFor(() => {
          component1.rerender();
          expect(component1.result.current.data?.length).toBe(1);
        });

        yieldRemoteControl.resolve();
        await waitFor(() => {
          component1.rerender();
          expect(component1.result.current.data?.length).toBe(2);
        });

        component1.unmount();

        yieldRemoteControl.resolve();
        await waitFor(() => {
          component2.rerender();
          expect(component2.result.current.data?.length).toBe(3);
        });
      });

      it('stops streaming responses when the second component also unmounts', async () => {
        const component1 = renderHook(usePuppyPhotos);
        const component2 = renderHook(usePuppyPhotos);

        yieldRemoteControl.resolve();
        await waitFor(() => {
          component1.rerender();
          expect(component1.result.current.data?.length).toBe(1);
        });

        component1.unmount();

        yieldRemoteControl.resolve();
        await waitFor(() => {
          component2.rerender();
          expect(component2.result.current.data?.length).toBe(2);
        });

        component2.unmount();

        yieldRemoteControl.resolve();
        await verifyNeverOccurs(() => {
          // Can't use rerender(), since the component is unmounted. So we'll
          // check the store's value directly.
          expect(useStore.getState().puppyPhotos.data?.length).toBe(3);
        });
      });
    });
  });
});
