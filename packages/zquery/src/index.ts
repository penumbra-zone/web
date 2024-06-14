import type { CreateZQueryStreamingProps, CreateZQueryUnaryProps, ZQuery } from './types';
import { getUseHook } from './get-use-hook';
import { getSlice } from './get-slice';

export type { ZQueryState } from './types';

/** `hello world` -> `Hello world` */
const capitalize = <Str extends string>(str: Str): Capitalize<Str> =>
  (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<Str>;

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
  const { name, get, getUseStore } = props;

  return {
    [`use${capitalize(name)}`]: getUseHook(props),

    [`useRevalidate${capitalize(name)}`]: () => {
      const useStore = getUseStore();
      const returnValue = useStore((state: State) => get(state).revalidate);
      return returnValue;
    },

    [name]: getSlice(props),
  } as ZQuery<Name, ProcessedDataType, FetchArgs>;
}
