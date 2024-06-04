import { StoreApi } from 'zustand';
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
  [key in `${Name}Selector`]: () => ZQueryState<DataType>;
} & {
  [key in `revalidate${Capitalize<Name>}Selector`]: () => VoidFunction;
} & Record<Name, (store: StoreApi<StoreType>) => ZQueryState<DataType>>;

export const createZQuery = <StoreType, Name extends string, DataType, FetchArgs extends unknown[]>(
  name: Name,
  fetch: (...args: FetchArgs) => Promise<DataType>,
  set: (value: ZQueryState<DataType>) => void,
  get: (state: StoreType) => ZQueryState<DataType>,
): ZQuery<Name, DataType, StoreType> =>
  ({
    [`${capitalize(name)}Selector`]: () =>
      useShallow((state: StoreType) => {
        const zQuery = get(state);

        return {
          data: zQuery.data,
          loading: zQuery.loading,
          error: zQuery.error,
        };
      }),

    [`revalidate${name}Selector`]: () => useShallow((state: StoreType) => get(state).revalidate),

    [name]: (store: StoreApi<StoreType>) => ({
      data: undefined,
      loading: false,
      error: undefined,

      revalidate: () => Promise.resolve(),

      _zQueryInternal: {
        fetch: async (...args: FetchArgs) => {
          try {
            const data = await fetch(...args);
            set({ ...get(store.getState()), data });
          } catch (error) {
            set({ ...get(store.getState()), error });
          }
        },
      },
    }),
  }) as ZQuery<Name, DataType, StoreType>;
