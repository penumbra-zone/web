export interface ZQueryState<DataType, FetchArgs extends unknown[] = []> {
  data?: DataType | undefined;
  loading: boolean;
  error?: unknown;

  revalidate: (...args: FetchArgs) => void;

  _zQueryInternal: {
    fetch: (...args: FetchArgs) => Promise<void>;
  };
}

export type FetchTypePromise<DataType, FetchArgs extends unknown[]> = (
  ...args: FetchArgs
) => Promise<DataType>;

export type FetchTypeAsyncIterable<DataType, FetchArgs extends unknown[]> = (
  ...args: FetchArgs
) => AsyncIterable<DataType>;

interface CreateZQueryCommonProps<Name extends string, State> {
  /** The name of this property in the state/slice. */
  name: Name;
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

export interface CreateZQueryUnaryProps<
  Name extends string,
  State,
  DataType,
  FetchArgs extends unknown[],
> extends CreateZQueryCommonProps<Name, State> {
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
  get: (state: State) => ZQueryState<DataType, FetchArgs>;
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
  set: (value: ZQueryState<DataType, FetchArgs>) => void;
}

export interface CreateZQueryStreamingProps<
  Name extends string,
  State,
  DataType,
  FetchArgs extends unknown[],
  ProcessedDataType,
> extends CreateZQueryCommonProps<Name, State> {
  /** A function that executes the query. */
  fetch: FetchTypeAsyncIterable<DataType, FetchArgs>;
  /**
   * Set to `true` if `fetch` will return a streaming response in the form of an
   * `AsyncIterable`.
   *
   * Or, if you wish to modify the streaming results as they come in before
   * they're added to the state, set this to a function that takes the current state
   * as its first argument and the streamed item as its second, and returns the
   * desired new state (or a promise containing the desired new state). This can
   * be useful for e.g. sorting items in the state as new items are streamed.
   */
  stream: (prevData: ProcessedDataType | undefined, item: DataType) => ProcessedDataType;
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
  get: (state: State) => ZQueryState<ProcessedDataType, FetchArgs>;
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
  set: (value: ZQueryState<ProcessedDataType, FetchArgs>) => void;
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

export type ZQuery<Name extends string, DataType, FetchArgs extends unknown[]> = {
  [key in `use${Capitalize<Name>}`]: (...args: FetchArgs) => {
    data?: DataType;
    loading: boolean;
    error?: unknown;
  };
} & {
  [key in `useRevalidate${Capitalize<Name>}`]: () => (...args: FetchArgs) => void;
} & Record<Name, ZQueryState<DataType, FetchArgs>>;
