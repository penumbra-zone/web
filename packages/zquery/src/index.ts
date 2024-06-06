import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type {
  CreateZQueryStreamingProps,
  CreateZQueryUnaryProps,
  FetchOptions,
  ZQuery,
} from './types';

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

const DEFAULT_FETCH_OPTIONS: Required<FetchOptions> = {};

/**
 * Creates a ZQuery object that can be used to store server data in Zustand
 * state.
 *
 * ## Usage
 * First, create a ZQuery object (see individual parameters for docs on how to
 * use them):
 *
 * ```ts
 * export const { puppyPhotos, usePuppyPhotos, useRevalidatePuppyPhotos } = createZQuery({
 *   name: 'puppyPhotos',
 *   fetch: asyncFunctionThatFetchesAndReturnsPuppyPhotos,
 *   getUseStore: () => useStore,
 *   set: setter => {
 *     useStore.setState(state => {
 *       ...state,
 *       puppyPhotos: setter(state),
 *     }),
 *   },
 *   get: state => state.puppyPhotos,
 * })
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
export function createZQuery<
  State,
  Name extends string,
  DataType,
  FetchArgs extends unknown[],
  ProcessedDataType extends DataType = DataType,
>(
  props: CreateZQueryUnaryProps<Name, State, ProcessedDataType, FetchArgs>,
): ZQuery<Name, ProcessedDataType, FetchArgs>;

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
): ZQuery<Name, ProcessedDataType, FetchArgs> {
  const { name, get, set, getUseStore } = props;

  const setAbortController = (abortController: AbortController | undefined) => {
    set(prevState => ({
      ...prevState,
      _zQueryInternal: {
        ...prevState?._zQueryInternal,
        abortController,
      },
    }));
  };

  const incrementReferenceCounter = () => {
    const newReferenceCount = get(getUseStore().getState())._zQueryInternal.referenceCount + 1;

    set(prevState => ({
      ...prevState,
      _zQueryInternal: {
        ...prevState._zQueryInternal,
        referenceCount: newReferenceCount,
      },
    }));

    return newReferenceCount;
  };

  const decrementReferenceCounter = () => {
    const newReferenceCount = get(getUseStore().getState())._zQueryInternal.referenceCount - 1;

    set(prevState => ({
      ...prevState,
      _zQueryInternal: {
        ...prevState._zQueryInternal,
        referenceCount: newReferenceCount,
      },
    }));

    return newReferenceCount;
  };

  return {
    [`use${capitalize(name)}`]: (...args: FetchArgs) => {
      const useStore = getUseStore();

      useEffect(() => {
        const fetch = get(useStore.getState())._zQueryInternal.fetch;
        if (!get(useStore.getState())?._zQueryInternal) return;

        {
          const newReferenceCount = incrementReferenceCounter();

          if (newReferenceCount === 1) {
            setAbortController(new AbortController());
            void fetch(...args);
          }
        }

        const onUnmount = () => {
          const newReferenceCount = decrementReferenceCounter();

          if (newReferenceCount === 0) {
            get(useStore.getState())._zQueryInternal.abortController?.abort();
            setAbortController(undefined);
          }
        };

        return onUnmount;
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

      revalidate: (...args: FetchArgs) => {
        const { _zQueryInternal } = get(getUseStore().getState());
        _zQueryInternal.abortController?.abort();
        setAbortController(new AbortController());
        void _zQueryInternal.fetch(...args);
      },

      _zQueryInternal: {
        referenceCount: 0,

        fetch: async ({}: FetchOptions = DEFAULT_FETCH_OPTIONS, ...args: FetchArgs) => {
          const abortController = get(getUseStore().getState())._zQueryInternal.abortController;
          // We have to use the `props` object (rather than its destructured
          // properties) since we're passing the full `props` object to
          // `isStreaming`, which is a type predicate. If we use previously
          // destructured properties after the type predicate, the type
          // predicate won't apply to them, since the type predicate was called
          // after destructuring.
          if (isStreaming<Name, State, DataType, FetchArgs, ProcessedDataType>(props)) {
            const result = props.fetch(...args);

            props.set(prevState => ({
              ...prevState,
              data: undefined,
            }));

            try {
              for await (const item of result) {
                if (abortController?.signal.aborted) return;

                props.set(prevState => ({
                  ...prevState,
                  data: props.stream(prevState.data, item),
                }));
              }
            } catch (error) {
              props.set(prevState => ({ ...prevState, error }));
            }
          } else {
            try {
              const data = await props.fetch(...args);
              props.set(prevState => ({ ...prevState, data }));
            } catch (error) {
              props.set(prevState => ({ ...prevState, error }));
            }
          }
        },
      },
    },
  } as ZQuery<Name, ProcessedDataType, FetchArgs>;
}
