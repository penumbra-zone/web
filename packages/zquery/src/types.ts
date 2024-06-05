export interface ZQueryState<DataType> {
  data?: DataType | undefined;
  loading: boolean;
  error?: unknown;

  revalidate: () => void;

  _zQueryInternal: {
    fetch: () => Promise<void>;
  };
}

export type DataTypeInState<
  DataType,
  FetchType extends
    | FetchTypePromise<DataType, FetchArgs>
    | FetchTypeAsyncGenerator<DataType, FetchArgs>,
  FetchArgs extends unknown[],
> = FetchType extends FetchTypePromise<DataType, FetchArgs> ? DataType : DataType[];

export type FetchTypePromise<DataType, FetchArgs extends unknown[]> = (
  ...args: FetchArgs
) => Promise<DataType>;

export type FetchTypeAsyncGenerator<DataType, FetchArgs extends unknown[]> = (
  ...args: FetchArgs
) => AsyncGenerator<DataType>;

export type StreamType<DataType> =
  | true
  | ((state: DataType[], item: DataType) => DataType[])
  | ((state: DataType[], item: DataType) => Promise<DataType[]>);

interface CreateZQueryCommonProps<State> {
  /** The name of this property in the state/slice. */
  name: string;
  /**
   * A function that returns your `useStore` object -- e.g.: `() => useStore`
   *
   * If you passed `useStore` directly to `createZQuery`, which is called while
   * defining `useStore`, you'd get a circular dependency. To work around that,
   * pass a function that returns `useStore`, so that it can be used later (once
   * `useStore` is defined).
   */
  getUseStore: () => UseStore<State>;
}

export interface CreateZQueryUnaryProps<State, DataType, FetchArgs extends unknown[]>
  extends CreateZQueryCommonProps<State> {
  stream?: undefined;
  /** A function that executes the query. */
  fetch: FetchTypePromise<DataType, FetchArgs>;
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
  get: (state: State) => ZQueryState<DataType>;
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
  set: (value: ZQueryState<DataType>) => void;
}

export interface CreateZQueryStreamingProps<State, DataType, FetchArgs extends unknown[]>
  extends CreateZQueryCommonProps<State> {
  /** A function that executes the query. */
  fetch: FetchTypeAsyncGenerator<DataType, FetchArgs>;
  /**
   * Set to `true` if `fetch` will return a streaming response in the form of an
   * `AsyncGenerator`.
   *
   * Or, if you wish to modify the streaming results as they come in before
   * they're added to the state, set this to a function that takes the current state
   * as its first argument and the streamed item as its second, and returns the
   * desired new state (or a promise containing the desired new state). This can
   * be useful for e.g. sorting items in the state as new items are streamed.
   */
  stream: StreamType<DataType>;
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
  get: (state: State) => ZQueryState<DataType[]>;
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
  set: (value: ZQueryState<DataType[]>) => void;
}

/**
 * A simplified version of `UseBoundStore<StoreApi<State>>`.
 *
 * We only use the `useStore()` hook and the `useStore.getState()` method in
 * ZQuery, and we don't want to have to accommodate all of the different types
 * that a `useStore` object can have when used with various middlewares, etc.
 * For example, a "normal" `useStore` object is typed as
 * `UseBoundStore<StoreApi<State>>`, but a `useStore` object created with Immer
 * middleware is typed as `UseBoundStore<WithImmer<StoreApi<State>>>`. A
 * function that accepts a `useStore` of the former type won't accept a
 * `useStore` of the latter type (or of various other store types that mutated
 * by middleware), so we'll just create a loose typing for `useStore` that can
 * accommodate whatever middleware is being used.
 */
export type UseStore<State> = (<T>(selector: (state: State) => T) => T) & { getState(): State };

/**
 * The type returned by calling the `use<Name>()` hook.
 */
export interface UseZQuery<DataType> {
  data?: DataType;
  loading: boolean;
  error?: unknown;
}

export type ZQuery<Name extends string, DataType> = {
  [key in `use${Capitalize<Name>}`]: () => UseZQuery<DataType>;
} & {
  [key in `useRevalidate${Capitalize<Name>}`]: () => VoidFunction;
} & Record<Name, ZQueryState<DataType>>;
