import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type {
  CreateZQueryProps,
  DataTypeInState,
  FetchTypeAsyncGenerator,
  FetchTypePromise,
  StreamType,
  ZQuery,
} from './types';

export type { ZQueryState } from './types';

/** `hello world` -> `Hello world` */
const capitalize = <Str extends string>(str: Str): Capitalize<Str> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<Str>;

const isStreamingResponse = <DataType, FetchArgs extends unknown[]>(
  _fetch: FetchTypePromise<DataType, FetchArgs> | FetchTypeAsyncGenerator<DataType, FetchArgs>,
  stream?: StreamType<DataType>,
): _fetch is FetchTypeAsyncGenerator<DataType, FetchArgs> => !!stream;

/**
 * Creates a ZQuery object that can be used to store server data in Zustand
 * state.
 *
 * ## Usage
 * First, create a ZQuery object (see individual parameters for docs on how to
 * use them):
 *
 * ```ts
 * export const { puppyPhotos, usePuppyPhotos, useRevalidatePuppyPhotos } = createZQuery(
 *   'puppyPhotos',
 *   asyncFunctionThatFetchesAndReturnsPuppyPhotos,
 *   () => useStore,
 *   newValue => {
 *     useStore.setState(state => {
 *       ...state,
 *       puppyPhotos: newValue,
 *     }),
 *   },
 *   state => state.puppyPhotos,
 * )
 * ```
 *
 * Then, attach the property with the object's name to your Zustand state:
 *
 * ```ts
 * const useStore = create<State>()(set => ({
 *  // ...
 *  puppyPhotos, // destructured from the return value of `createZQuery()` above
 * }))
 * ```
 *
 * Finally, in your component, use the hooks as needed:
 *
 * ```tsx
 * import { usePuppyPhotos, useRevalidatePuppyPhotos } from './state'
 *
 * const PuppyPhotos = () => {
 *   const puppyPhotos = usePuppyPhotos()
 *   const revalidate = useRevalidatePuppyPhotos()
 *
 *   return (
 *     <div>
 *       {puppyPhotos.error && <div>{JSON.stringify(puppyPhotos.error)}</div>}
 *       {puppyPhotos.data?.map(puppyPhoto => (
 *         <img src={puppyPhoto.src} alt={puppyPhoto.alt} />
 *       ))}
 *
 *       <button disabled={puppyPhotos.loading} onClick={revalidate}>
 *         Reload puppy photos
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export const createZQuery = <State, Name extends string, DataType, FetchArgs extends unknown[]>({
  name,
  fetch,
  stream,
  getUseStore,
  set,
  get,
}: CreateZQueryProps<State, DataType, FetchArgs>): ZQuery<
  Name,
  DataTypeInState<DataType, typeof fetch, Parameters<typeof fetch>>
> =>
  ({
    [`use${capitalize(name)}`]: () => {
      const useStore = getUseStore();
      const fetch = get(useStore.getState())._zQueryInternal.fetch;

      useEffect(() => {
        void fetch();
      }, [fetch]);

      return useStore(
        useShallow(state => {
          const zQuery = get(state);

          return {
            data: zQuery.data,
            loading: zQuery.loading,
            error: zQuery.error,
          };
        }),
      );
    },

    [`useRevalidate${capitalize(name)}`]: () => {
      const useStore = getUseStore();
      return useStore(useShallow((state: State) => get(state).revalidate));
    },

    [name]: {
      data: undefined,
      loading: false,
      error: undefined,

      revalidate: () => void get(getUseStore().getState())._zQueryInternal.fetch(),

      _zQueryInternal: {
        fetch: async (...args: FetchArgs) => {
          if (isStreamingResponse<DataType, FetchArgs>(fetch, stream)) {
            const result = fetch(...args);
            let data: DataType[] = [];
            set({ ...get(getUseStore().getState()), data });

            for await (const item of result) {
              if (typeof stream === 'function') {
                data = await stream(data, item);
              } else {
                data.push(item);
              }

              set({ ...get(getUseStore().getState()), data });
            }
          } else {
            try {
              const data = await fetch(...args);
              set({ ...get(getUseStore().getState()), data });
            } catch (error) {
              set({ ...get(getUseStore().getState()), error });
            }
          }
        },
      },
    },
  }) as ZQuery<Name, DataTypeInState<DataType, typeof fetch, Parameters<typeof fetch>>>;
