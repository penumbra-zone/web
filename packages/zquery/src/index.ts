import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { CreateZQueryStreamingProps, CreateZQueryUnaryProps, ZQuery } from './types';

export type { ZQueryState } from './types';

/** `hello world` -> `Hello world` */
const capitalize = <Str extends string>(str: Str): Capitalize<Str> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<Str>;

const isStreaming = <Name extends string, State, DataType, FetchArgs extends unknown[]>(
  props:
    | CreateZQueryUnaryProps<Name, State, DataType, FetchArgs>
    | CreateZQueryStreamingProps<Name, State, DataType, FetchArgs>,
): props is CreateZQueryStreamingProps<Name, State, DataType, FetchArgs> => !!props.stream;

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
): ZQuery<Name, DataType>;

export function createZQuery<State, Name extends string, DataType, FetchArgs extends unknown[]>(
  props: CreateZQueryStreamingProps<Name, State, DataType, FetchArgs>,
): ZQuery<Name, DataType[]>;

export function createZQuery<State, Name extends string, DataType, FetchArgs extends unknown[]>(
  props:
    | CreateZQueryUnaryProps<Name, State, DataType, FetchArgs>
    | CreateZQueryStreamingProps<Name, State, DataType, FetchArgs>,
): ZQuery<Name, DataType> | ZQuery<Name, DataType[]> {
  const { name, getUseStore } = props;

  return {
    [`use${capitalize(props.name)}`]: () => {
      const useStore = props.getUseStore();
      const fetch = props.get(useStore.getState())._zQueryInternal.fetch;

      useEffect(() => {
        void fetch();
      }, [fetch]);

      const returnValue = useStore(
        useShallow(state => {
          const zQuery = props.get(state);

          return {
            data: zQuery.data,
            loading: zQuery.loading,
            error: zQuery.error,
          };
        }),
      );

      return returnValue;
    },

    [`useRevalidate${capitalize(props.name)}`]: () => {
      const useStore = props.getUseStore();
      const returnValue = useStore(useShallow((state: State) => props.get(state).revalidate));
      return returnValue;
    },

    [name]: {
      data: undefined,
      loading: false,
      error: undefined,

      revalidate: () => void props.get(getUseStore().getState())._zQueryInternal.fetch(),

      _zQueryInternal: {
        fetch: async (...args: FetchArgs) => {
          if (isStreaming<Name, State, DataType, FetchArgs>(props)) {
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
  } as ZQuery<Name, DataType[]>;
}
