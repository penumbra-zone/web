import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { CreateZQueryStreamingProps, CreateZQueryUnaryProps, ZQuery } from './types';

export type { ZQueryState } from './types';

/** `hello world` -> `Hello world` */
const capitalize = <Str extends string>(str: Str): Capitalize<Str> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<Str>;

const isStreaming = <
  Name extends string,
  State,
  DataType,
  FetchArgs extends unknown[],
  ProcessedDataType,
>(
  props:
    | CreateZQueryUnaryProps<Name, State, DataType, FetchArgs>
    | CreateZQueryStreamingProps<Name, State, DataType, FetchArgs, ProcessedDataType>,
): props is CreateZQueryStreamingProps<Name, State, DataType, FetchArgs, ProcessedDataType> =>
  !!props.stream;

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
  props: CreateZQueryUnaryProps<Name, State, DataType, FetchArgs>,
): ZQuery<Name, DataType, FetchArgs>;

export function createZQuery<
  State,
  Name extends string,
  DataType,
  FetchArgs extends unknown[],
  ProcessedDataType,
>(
  props: CreateZQueryStreamingProps<Name, State, DataType, FetchArgs, ProcessedDataType>,
): ZQuery<Name, ProcessedDataType, FetchArgs>;

export function createZQuery<
  State,
  Name extends string,
  DataType,
  FetchArgs extends unknown[],
  ProcessedDataType = DataType,
>(
  props:
    | CreateZQueryUnaryProps<Name, State, DataType, FetchArgs>
    | CreateZQueryStreamingProps<Name, State, DataType, FetchArgs, ProcessedDataType>,
): ZQuery<Name, DataType, FetchArgs> | ZQuery<Name, ProcessedDataType, FetchArgs> {
  const { name, get, getUseStore } = props;

  return {
    [`use${capitalize(name)}`]: (...args: FetchArgs) => {
      const useStore = getUseStore();
      const fetch = get(useStore.getState())._zQueryInternal.fetch;

      useEffect(() => {
        void fetch(...args);
      }, [fetch]);

      const returnValue = useStore(
        useShallow(state => {
          const zQuery = get(state);

          return {
            data: zQuery.data,
            loading: zQuery.loading,
            error: zQuery.error,
          };
        }),
      );

      return returnValue;
    },

    [`useRevalidate${capitalize(name)}`]: () => {
      const useStore = getUseStore();
      const returnValue = useStore(useShallow((state: State) => get(state).revalidate));
      return returnValue;
    },

    [name]: {
      data: undefined,
      loading: false,
      error: undefined,

      revalidate: (...args: FetchArgs) =>
        void get(getUseStore().getState())._zQueryInternal.fetch(...args),

      _zQueryInternal: {
        fetch: async (...args: FetchArgs) => {
          // We have to use the `props` object (rather than its destructured
          // properties) since we're passing the full `props` object to
          // `isStreaming`, which is a type predicate. If we use previously
          // destructured properties after the type predicate, the type
          // predicate won't apply to them, since the type predicate was called
          // after destructuring.
          if (isStreaming<Name, State, DataType, FetchArgs, ProcessedDataType>(props)) {
            const result = props.fetch(...args);

            props.set({ ...props.get(getUseStore().getState()), data: undefined });

            try {
              for await (const item of result) {
                const prevState = props.get(getUseStore().getState());
                const data = props.stream(prevState.data, item);

                props.set({ ...prevState, data });
              }
            } catch (error) {
              const prevState = props.get(getUseStore().getState());
              props.set({ ...prevState, error });
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
  } as ZQuery<Name, DataType, FetchArgs> | ZQuery<Name, ProcessedDataType, FetchArgs>;
}
