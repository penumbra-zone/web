import { StoreApi, UseBoundStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export interface ZQueryState<DataType> {
  data?: DataType;
  loading: boolean;
  error?: unknown;

  revalidate: () => Promise<void>;

  _zQueryInternal: {
    fetch: () => Promise<void>;
  };
}

/** `hello world` -> `Hello world` */
const capitalize = <Str extends string>(str: Str): Capitalize<Str> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<Str>;

type ZQuery<Name extends string, DataType, StoreType> = {
  [key in `use${Capitalize<Name>}`]: (
    useStore: UseBoundStore<StoreApi<StoreType>>,
  ) => ZQueryState<DataType>;
} & {
  [key in `useRevalidate${Capitalize<Name>}`]: (
    useStore: UseBoundStore<StoreApi<StoreType>>,
  ) => VoidFunction;
} & Record<Name, (store: StoreApi<StoreType>) => ZQueryState<DataType>>;

export const createZQuery = <StoreType, Name extends string, DataType>(
  name: Name,
  fetch: () => Promise<DataType>,
  set: (value: ZQueryState<DataType>) => void,
  get: (state: StoreType) => ZQueryState<DataType>,
): ZQuery<Name, DataType, StoreType> =>
  ({
    [`use${capitalize(name)}`]: (useStore: UseBoundStore<StoreApi<StoreType>>) =>
      useStore(
        useShallow((state: StoreType) => {
          const zQuery = get(state);
          void zQuery._zQueryInternal.fetch();

          return {
            data: zQuery.data,
            loading: zQuery.loading,
            error: zQuery.error,
          };
        }),
      ),

    [`useRevalidate${capitalize(name)}`]: (useStore: UseBoundStore<StoreApi<StoreType>>) =>
      useStore(useShallow((state: StoreType) => get(state).revalidate)),

    [name]: (store: StoreApi<StoreType>) => ({
      data: undefined,
      loading: false,
      error: undefined,

      revalidate: () => Promise.resolve(),

      _zQueryInternal: {
        fetch: async () => {
          try {
            const data = await fetch();
            set({ ...get(store.getState()), data });
          } catch (error) {
            set({ ...get(store.getState()), error });
          }
        },
      },
    }),
  }) as ZQuery<Name, DataType, StoreType>;
