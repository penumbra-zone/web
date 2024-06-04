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

/**
 * Not exported from Zustand, so we need to copy it here.
 */
type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

type ZQuery<Name extends string, DataType> = {
  [key in `use${Capitalize<Name>}`]: () => ZQueryState<DataType>;
} & {
  [key in `useRevalidate${Capitalize<Name>}`]: () => VoidFunction;
} & Record<Name, ZQueryState<DataType>>;

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
      [`use${capitalize(name)}`]: () =>
        useStore(
          useShallow(state => {
            const zQuery = get(state);

            return {
              data: zQuery.data,
              loading: zQuery.loading,
              error: zQuery.error,
            };
          }),
        ),

      [`useRevalidate${capitalize(name)}`]: () =>
        useStore(useShallow(state => get(state).revalidate)),

      [name]: {
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
