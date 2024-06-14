import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createZQuery } from '.';
import { MOCK_PUPPY_PHOTOS, PuppyPhoto, State } from './test/mock-state';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { ZQuery } from './types';
import { waitFor } from '@testing-library/react';

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

      describe('the reducers returned by the `stream()` function', () => {
        /**
         * A "remote control" that we'll use to control the streaming of responses
         * in the mock fetch function.
         */
        let yieldRemoteControl: PromiseWithResolvers<void>;
        const onEndSortFunction = (a: PuppyPhoto, b: PuppyPhoto) => (a.name < b.name ? -1 : 1);

        beforeEach(() => {
          fetch.mockReset();

          yieldRemoteControl = Promise.withResolvers<void>();
          fetch.mockImplementation(async function* () {
            for (const puppyPhoto of MOCK_PUPPY_PHOTOS) {
              try {
                await yieldRemoteControl.promise;
                yield puppyPhoto;
                yieldRemoteControl = Promise.withResolvers<void>();
              } catch (e) {
                yieldRemoteControl = Promise.withResolvers<void>();
                throw e;
              }
            }
          });

          zQuery = createZQuery({
            name: 'puppyPhotos',
            fetch,
            stream: () => ({
              // For our test, we'll use `onStart` to clear out previous
              // results.
              onStart: () => [],

              onValue: (prevState: PuppyPhoto[] | undefined = [], puppyPhoto: PuppyPhoto) => [
                ...prevState,
                puppyPhoto,
              ],

              // For our test, we'll use `onEnd` to sort results.
              onEnd: (prevState: PuppyPhoto[] | undefined = []) =>
                [...prevState].sort(onEndSortFunction),

              // A contrived implementation for the sake of the test.
              onError: (prevState: PuppyPhoto[] | undefined = [], error: unknown) => {
                if (typeof error === 'string') {
                  return [
                    ...prevState,
                    {
                      id: error,
                      name: error,
                      url: `${error}.jpg`,
                    },
                  ];
                }
                return prevState;
              },

              // A contrived implementation for the sake of the test.
              onAbort: (prevState: PuppyPhoto[] | undefined = []) => {
                console.log('calling onAbort');
                return [...prevState, { id: 'aborted', name: 'aborted', url: 'aborted.jpg' }];
              },
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
          });

          const { puppyPhotos } = zQuery;

          useStore = create<State>()(() => ({
            puppyPhotos,
          }));
        });

        it('reduces values to the value returned by `stream().onValue()`', async () => {
          const getData = () => useStore.getState().puppyPhotos.data;
          useStore.getState().puppyPhotos.revalidate();

          expect(getData()).toHaveLength(0);

          yieldRemoteControl.resolve();
          await waitFor(() => expect(getData()).toEqual([MOCK_PUPPY_PHOTOS[0]]));

          yieldRemoteControl.resolve();
          await waitFor(() =>
            expect(getData()).toEqual([MOCK_PUPPY_PHOTOS[0], MOCK_PUPPY_PHOTOS[1]]),
          );

          // We'll assert on the third puppy photo in the separate test for
          // `.onEnd()`, since that affects sorting.
        });

        it('reduces values to the value returned by `stream().onStart()` when a stream restarts`', async () => {
          const getData = () => useStore.getState().puppyPhotos.data;
          useStore.getState().puppyPhotos.revalidate();

          await waitFor(() => {
            yieldRemoteControl.resolve();
            expect(getData()?.length).toBe(3);
          });

          useStore.getState().puppyPhotos.revalidate();
          expect(getData()).toHaveLength(0);
        });

        it('reduces values to the value returned by `stream().onEnd()` when a stream ends`', async () => {
          const getData = () => useStore.getState().puppyPhotos.data;
          useStore.getState().puppyPhotos.revalidate();

          await waitFor(() => {
            yieldRemoteControl.resolve();
            expect(getData()?.length).toBe(3);
          });

          // Make sure that `MOCK_PUPPY_PHOTOS` isn't already sorted by name, or
          // else this test is useless.
          expect(getData()).not.toEqual(MOCK_PUPPY_PHOTOS);
          expect(getData()).toEqual([...MOCK_PUPPY_PHOTOS].sort(onEndSortFunction));
        });

        it('reduces values to the value returned by `stream().onError()` when a stream errors', async () => {
          const getData = () => useStore.getState().puppyPhotos.data;
          useStore.getState().puppyPhotos.revalidate();

          yieldRemoteControl.resolve();
          await waitFor(() => expect(getData()).toEqual([MOCK_PUPPY_PHOTOS[0]]));

          yieldRemoteControl.reject('oops');
          await waitFor(() =>
            expect(getData()).toEqual([
              MOCK_PUPPY_PHOTOS[0],
              { id: 'oops', name: 'oops', url: 'oops.jpg' },
            ]),
          );
        });

        it('reduces values to the value returned by `stream().onAbort()` when a stream is aborted', async () => {
          const getData = () => useStore.getState().puppyPhotos.data;
          useStore.getState().puppyPhotos.revalidate();

          yieldRemoteControl.resolve();
          await waitFor(() => expect(getData()).toEqual([MOCK_PUPPY_PHOTOS[0]]));

          useStore.getState().puppyPhotos._zQueryInternal.abortController?.abort();

          yieldRemoteControl.resolve();
          await waitFor(() =>
            expect(getData()).toEqual([
              MOCK_PUPPY_PHOTOS[0],
              { id: 'aborted', name: 'aborted', url: 'aborted.jpg' },
            ]),
          );
        });
      });
    });
  });
});
