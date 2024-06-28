export interface AbridgedZQueryState<DataType> {
  data?: DataType | undefined;
  loading: boolean;
  error?: unknown;
}

export interface ZQueryState<DataType, FetchArgs extends unknown[] = []>
  extends AbridgedZQueryState<DataType> {
  revalidate: (...args: FetchArgs) => void;

  _zQueryInternal: {
    referenceCount: number;
    fetch: (...args: FetchArgs) => Promise<void>;
    abortController?: AbortController;
  };
}

export type UseHookOptions<
  ResolvedDataType,
  SelectorType extends
    | ((zQueryState: AbridgedZQueryState<ResolvedDataType>) => unknown)
    | undefined = undefined,
> = SelectorType extends undefined
  ? { select?: undefined; shouldReselect?: undefined } | undefined
  : {
      select: SelectorType;
      shouldReselect?: (
        before: AbridgedZQueryState<ResolvedDataType> | undefined,
        after: AbridgedZQueryState<ResolvedDataType>,
      ) => boolean;
    };

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
  fetch: (...args: FetchArgs) => Promise<DataType>;
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
   * createZQuery({
   *   // ...
   *   // ...
   *   // ...
   *   // ...
   *   get: state => state.deeply.nested.object,
   * })
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
   * createZQuery({
   *   // ...
   *   // ...
   *   // ...
   *   set: newValue => {
   *     // `newValue` is the entire ZQuery state object, and can be assigned
   *     // as-is to the property that holds the ZQuery state.
   *     useStore.setState(state => {
   *       state.deeply.nested.object = newValue;
   *     })
   *   },
   *   // ...
   * })
   * ```
   */
  set: (setter: <DataType, T extends ZQueryState<DataType, FetchArgs>>(prevState: T) => T) => void;
}

export interface CreateZQueryStreamingProps<
  Name extends string,
  State,
  DataType,
  FetchArgs extends unknown[],
  ProcessedDataType,
> extends CreateZQueryCommonProps<Name, State> {
  /** A function that executes the query. */
  fetch: (...args: FetchArgs) => AsyncIterable<DataType>;
  /**
   * This function is called whenever the fetch function is called. It receives
   * the current state at the start of the stream, and should return an object
   * containing at least an `onValue` method. See the individual methods' docs
   * for more information on how to use them.
   *
   * `stream` is a function rather than an object because you may wish to
   * maintain scope over the course of an entire stream. For example, you may
   * want to keep track of all the items that were received during this stream,
   * so that at the end of the stream, you can discard items from previous
   * streams.
   *
   * @example
   * ```ts
   * const { puppyPhotos, usePuppyPhotos } = createZQuery({
   *   name: 'puppyPhotos',
   *   fetch: fetchFunctionThatReturnsAStream,
   *   stream: () => {
   *     const puppyPhotoIdsToKeep = new Set<string>()
   *
   *     return {
   *       onValue: (prevState: PuppyPhotos[] | undefined = [], puppyPhoto: PuppyPhoto) => {
   *         puppyPhotoIdsToKeep.add(puppyPhoto.id);
   *
   *         const existingIndex = prevState.findIndex(({ id }) => id === puppyPhoto.id)
   *
   *         // Update any existing items in place, rather than appending
   *         // duplicates.
   *         if (existingIndex >= 0) return prevState.toSpliced(existingIndex, 1, puppyPhoto)
   *         else return [...prevState, puppyPhoto]
   *       },
   *
   *       onEnd: (prevState = []) =>
   *         // Discard any puppy photos from a previous stream.
   *         prevState.filter(puppyPhoto => puppyPhotoIdsToKeep.has(puppyPhoto.id)),
   *     }
   *   },
   * })
   * ```
   */
  stream: (startState: ProcessedDataType | undefined) => {
    /**
     * Called when a stream starts -- i.e., when the fetch function is called.
     *
     * Receives the previous state, and should return a new state. This can be
     * useful for e.g., clearing out existing state when a new fetch is started.
     */
    onStart?: (prevData: ProcessedDataType | undefined) => ProcessedDataType | undefined;
    /**
     * Called when a new value is received from the stream. Receives the
     * previous state and the new value, and should return a new state.
     *
     * Note that the return type of this function determines the TypeScript type
     * that is stored in state. So, if your fetch function returns an
     * `AsyncIterable<PuppyPhoto>`, and you use `onValue` to collect those into
     * an array, your stored data type will be `PuppyPhoto[] | undefined`:
     *
     * @example
     * ```ts
     * {
     *   stream: () => ({
     *     // The type stored in state will be `PuppyPhoto[] | undefined`
     *     onValue: (prevState: PuppyPhotos[] | undefined = [], puppyPhoto: PuppyPhoto) =>
     *       [...prevState, puppyPhoto]
     *   })
     * }
     * ```
     *
     * Or, if you use `onValue` to replace the previous streamed puppy photo
     * with the current one, your stored data type will be `PuppyPhoto |
     * undefined`:
     *
     * @example
     * ```ts
     * {
     *   stream: () => ({
     *     // The type stored in state will be `PuppyPhoto | undefined`
     *     onValue: (_, puppyPhoto: PuppyPhoto) => puppyPhoto
     *   })
     * }
     * ```
     *
     * Lastly, you can also reduce the stream to any arbitrary data type you
     * like, and your stored data type will be whatever type `onValue` returns.
     *
     * @example
     * ```ts
     * {
     *   stream: () => ({
     *     // The type stored in state will be `number | undefined`, and will
     *     // represent the total number of puppy photos streamed thus far.
     *     onValue: (prevState: number | undefined = 0) => prevState + 1,
     *   })
     * }
     *
     * // or...
     *
     * {
     *   stream: () => ({
     *     // The type stored in state will be `string | undefined`, and will
     *     // be a comma-separated list of puppy names.
     *     onValue: (prevState: string | undefined = '', puppyPhoto: PuppyPhoto) =>
     *       [...prevState.split(', '), puppyPhoto.name].join(', '),
     *   })
     * }
     * ```
     *
     * Note that the type stored in state includes `| undefined`. That's because
     * the initial state is always `undefined`.
     */
    onValue: (
      prevData: ProcessedDataType | undefined,
      value: DataType,
    ) => ProcessedDataType | undefined;
    /**
     * Called when a stream ends. Receives the state, and should return a new
     * state.
     *
     * Note that, if the stream errors or is aborted, `onEnd` is called _after_
     * `onError` or `onAbort`.
     */
    onEnd?: (prevData: ProcessedDataType | undefined) => ProcessedDataType | undefined;
    /**
     * Called when a stream errors. Receives the state and the error, and should
     * return a new state.
     */
    onError?: (
      prevData: ProcessedDataType | undefined,
      error: unknown,
    ) => ProcessedDataType | undefined;
    /**
     * Called when a stream is aborted. Receives the state, and should return a
     * new state.
     */
    onAbort?: (prevData: ProcessedDataType | undefined) => ProcessedDataType | undefined;
  };
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
   * createZQuery({
   *   // ...
   *   // ...
   *   // ...
   *   // ...
   *   get: state => state.deeply.nested.object,
   * })
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
   * createZQuery({
   *   // ...
   *   // ...
   *   // ...
   *   set: newValue => {
   *     // `newValue` is the entire ZQuery state object, and can be assigned
   *     // as-is to the property that holds the ZQuery state.
   *     useStore.setState(state => {
   *       state.deeply.nested.object = newValue;
   *     })
   *   },
   *   // ...
   * })
   * ```
   */
  set: (
    setter: <DataType extends ProcessedDataType, T extends ZQueryState<DataType, FetchArgs>>(
      prevState: T,
    ) => T,
  ) => void;
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
  [key in `use${Capitalize<Name>}`]: <
    SelectorType extends
      | ((zQueryState: AbridgedZQueryState<DataType>) => unknown)
      | undefined = undefined,
  >(
    options?: UseHookOptions<DataType, SelectorType>,
    ...fetchArgs: FetchArgs
  ) => SelectorType extends (zQueryState: AbridgedZQueryState<DataType>) => infer ReturnType
    ? // Must include `| undefined` in the return type because the first pass
      // through `useStore` doesn't return a value at all.
      ReturnType | undefined
    : AbridgedZQueryState<DataType>;
} & {
  [key in `useRevalidate${Capitalize<Name>}`]: () => (...fetchArgs: FetchArgs) => void;
} & Record<Name, ZQueryState<DataType, FetchArgs>>;
