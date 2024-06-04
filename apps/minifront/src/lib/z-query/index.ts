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

export const createZQuery = <StoreType, Name extends string, DataType>(
  name: Name,
  fetch: () => Promise<DataType>,
  getUseStore: () => UseBoundStore<StoreApi<StoreType>>,
  set: (value: ZQueryState<DataType>) => void,
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
