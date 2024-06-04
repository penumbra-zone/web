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

type ZQueryCreator<DataType> = (
  set: (value: ZQueryState<DataType>) => void,
  get: () => ZQueryState<DataType>,
) => ZQueryState<DataType>;

export const zQuery =
  <DataType>(fetch: () => Promise<DataType>): ZQueryCreator<DataType> =>
  (set, get) => ({
    data: undefined,
    loading: false,
    error: undefined,

    revalidate: () => Promise.resolve(),

    _zQueryInternal: {
      fetch: async () => {
        try {
          const data = await fetch();
          set({ ...get(), data });
        } catch (error) {
          set({ ...get(), error });
        }
      },
    },
  });

export const isZQuerySlice = (object: unknown): object is ZQueryState<unknown> =>
  typeof object === 'object' && !!object && '_zQueryInternal' in object;

const capitalizeFirstLetter = <Name extends string>(stringToCapitalize: Name): Capitalize<Name> =>
  (stringToCapitalize.charAt(0).toUpperCase() + stringToCapitalize.slice(1)) as Capitalize<Name>;

/**
 * Not exported from Zustand, so we need to copy it here.
 */
type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

type UseHookName<Name extends string> = `use${Capitalize<Name>}`;
type UseRevalidateHookName<Name extends string> = `useRevalidate${Capitalize<Name>}`;
type SliceName<Name extends string> = `${Name}Slice`;

type ZQuery<Name extends string, DataType> = {
  [key in UseHookName<Name>]: () => ZQueryState<DataType>;
} & {
  [key in UseRevalidateHookName<Name>]: () => VoidFunction;
} & {
  [key in SliceName<Name>]: ZQueryState<DataType>;
};

export const createZQuery =
  <Name extends string, DataType, StoreType>(
    name: Name,
    fetch: () => Promise<DataType>,
    useStore: UseBoundStore<StoreApi<StoreType>>,
  ): ((
    set: (value: ZQueryState<DataType>) => void,
    get: (state: ExtractState<StoreApi<StoreType>>) => ZQueryState<DataType>,
  ) => ZQuery<Name, DataType>) =>
  (set, get) =>
    ({
      [`use${capitalizeFirstLetter(name)}`]: () => {
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

      [`useRevalidate${capitalizeFirstLetter(name)}`]: () => useStore(useShallow(get)).revalidate,

      [`${name}Slice`]: {
        data: undefined,
        loading: false,
        error: undefined,

        revalidate: () => Promise.resolve(),

        _zQueryInternal: {
          fetch: async () => {
            try {
              const data = await fetch();
              set({ ...get(useStore.getState()), data });
            } catch (error) {
              set({ ...get(useStore.getState()), error });
            }
          },
        },
      },
    }) as ZQuery<Name, DataType>;
