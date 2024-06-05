import { useEffect } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export interface ZQueryState<DataType> {
  data?: DataType;
  loading: boolean;
  error?: unknown;

  revalidate: () => void;

  _zQueryInternal: {
    fetch: () => Promise<void>;
  };
}

/** `hello world` -> `Hello world` */
const capitalize = <Str extends string>(str: Str): Capitalize<Str> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<Str>;

type ZQuery<Name extends string, DataType> = {
  [key in `use${Capitalize<Name>}`]: () => ZQueryState<DataType>;
} & {
  [key in `useRevalidate${Capitalize<Name>}`]: () => VoidFunction;
} & Record<Name, ZQueryState<DataType>>;

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
export const createZQuery = <StoreType, Name extends string, DataType>(
  /** The name of this property in the state/slice. */
  name: Name,
  /** A function that executes the query. */
  fetch: () => Promise<DataType>,
  /**
   * A function that returns your `useStore` object -- e.g.: `() => useStore`
   *
   * If you passed `useStore` directly to `createZQuery`, which is called while
   * defining `useStore`, you'd get a circular dependency. To work around that,
   * pass a function that returns `useStore`, so that it can be used later (once
   * `useStore` is defined).
   */
  getUseStore: () => UseBoundStore<StoreApi<StoreType>>,
  /**
   * A setter that takes an updated ZQuery state object and assigns it to the
   * location in your overall Zustand state object where this ZQuery state
   * object is located.
   *
   * This ZQuery object doesn't know anything about the store or where this
   * ZQuery object is located within it, so it can't call `set()` with the
   * necessary spreads/etc. to ensure that the rest of the state is untouched
   * when the ZQuery state is updated. So your setter needs to handle that. For
   * example, if you have a deeply nested ZQuery object (located at
   * `state.deeply.nested.object`) and you're using Zustand's Immer middleware
   * to be able to imitate object mutations, you could pass this setter:
   *
   * ```ts
   * createZQuery(
   *   // ...
   *   // ...
   *   // ...
   *   newValue => {
   *     // `newValue` is the entire ZQuery state object, and can be assigned
   *     // as-is to the property that holds the ZQuery state.
   *     useStore.setState(state => {
   *       state.deeply.nested.object = newValue;
   *     })
   *   },
   *   // ...
   * )
   * ```
   */
  set: (value: ZQueryState<DataType>) => void,
  /**
   * A selector that takes the root Zustand state and returns just this ZQuery
   * state object.
   *
   * This ZQuery object doesn't know anything about the store or where this
   * ZQuery object is located within it, so it can't call
   * `getUseStore().getState()` and then navigate to its own location within
   * state. Thus, you need to pass it a selector so it can find itself.
   *
   * ```ts
   * createZQuery(
   *   // ...
   *   // ...
   *   // ...
   *   // ...
   *   state => state.deeply.nested.object,
   * )
   * ```
   */
  get: (state: StoreType) => ZQueryState<DataType>,
): ZQuery<Name, DataType> =>
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
      return useStore(useShallow((state: StoreType) => get(state).revalidate));
    },

    [name]: {
      data: undefined,
      loading: false,
      error: undefined,

      revalidate: () => void get(getUseStore().getState())._zQueryInternal.fetch(),

      _zQueryInternal: {
        fetch: async () => {
          try {
            const data = await fetch();
            set({ ...get(getUseStore().getState()), data });
          } catch (error) {
            set({ ...get(getUseStore().getState()), error });
          }
        },
      },
    },
  }) as ZQuery<Name, DataType>;
