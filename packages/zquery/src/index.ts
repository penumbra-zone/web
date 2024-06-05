import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { CreateZQueryStreamingProps, CreateZQueryUnaryProps, ZQuery } from './types';

export type { ZQueryState } from './types';

/** `hello world` -> `Hello world` */
const capitalize = <Str extends string>(str: Str): Capitalize<Str> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<Str>;

const isStreaming = <State, DataType, FetchArgs extends unknown[]>(
  props:
    | CreateZQueryUnaryProps<State, DataType, FetchArgs>
    | CreateZQueryStreamingProps<State, DataType, FetchArgs>,
): props is CreateZQueryStreamingProps<State, DataType, FetchArgs> => !!props.stream;

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
export function createZQuery<State, Name extends string, DataType, FetchArgs extends unknown[]>(
  props: CreateZQueryUnaryProps<State, DataType, FetchArgs>,
): ZQuery<Name, DataType>;

export function createZQuery<State, Name extends string, DataType, FetchArgs extends unknown[]>(
  props: CreateZQueryStreamingProps<State, DataType, FetchArgs>,
): ZQuery<Name, DataType[]>;

export function createZQuery<State, Name extends string, DataType, FetchArgs extends unknown[]>(
  props:
    | CreateZQueryUnaryProps<State, DataType, FetchArgs>
    | CreateZQueryStreamingProps<State, DataType, FetchArgs>,
): ZQuery<Name, DataType> | ZQuery<Name, DataType[]> {
  const { name, getUseStore, get } = props;

  return {
    [`use${capitalize(props.name)}`]: () => {
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

    [`useRevalidate${capitalize(props.name)}`]: () => {
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
          // We'll use `props.<propName>` inside this `fetch()` method, rather
          // than destructuring `props`, because we need to pass the whole
          // `props` object to `isStreaming` to assert its type.
          if (isStreaming<State, DataType, FetchArgs>(props)) {
            const result = props.fetch(...args);
            let data: DataType[] = [];
            props.set({ ...props.get(getUseStore().getState()), data });

            for await (const item of result) {
              if (typeof props.stream === 'function') {
                data = await props.stream(data, item);
              } else {
                data.push(item);
              }

              props.set({ ...props.get(getUseStore().getState()), data });
            }
          } else {
            try {
              const data = await props.fetch(...args);
              props.set({ ...props.get(getUseStore().getState()), data });
            } catch (error) {
              props.set({ ...props.get(getUseStore().getState()), error });
            }
          }
        },
      },
    },
  } as ZQuery<Name, DataType> | ZQuery<Name, DataType[]>;
}
