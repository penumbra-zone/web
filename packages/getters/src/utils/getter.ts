export interface Getter<SourceType, TargetType> {
  /**
   * Given an input value of `SourceType`, asserts successful retrieval of a
   * value of `TargetType`, by the naive retrieval function passed to
   * `createGetter`.
   *
   * If undefined access occurs while retrieving `TargetType`, a
   * `GetterMissingValueError` is thrown.
   */
  (value?: SourceType): TargetType;

  /**
   * Every getter contains an `optional` getter, which adds `undefined` to the
   * target type, and which will not throw `GetterMissingValueError`.
   *
   * @example
   * ```ts
   * const getMetadataFromValueView = createGetter<ValueView, Metadata>(valueView =>
   *   valueView?.valueView.case === 'knownAssetId' ? valueView.valueView.value.metadata : undefined,
   * );
   *
   * // Note that this `emptyValueView` has no metadata, nor even a `case`.
   * const emptyValueView = new ValueView();
   *
   * // Doesn't throw, even though the metadata is missing.
   * const noMetadata: Metadata | undefined = getMetadataFromValueView.optional(emptyValueView);
   * ```
   */
  readonly optional: Getter<SourceType, TargetType | undefined>;

  /**
   * Every getter contains a `required` getter, which wraps `NonNullable` around
   * the target type, and which will throw `GetterMissingValueError` if the
   * accessed result is `undefined`.
   */
  readonly required: Getter<SourceType, NonNullable<TargetType>>;

  /**
   * Call `pipe` to create a getter for the return type of another getter or
   * selector function provided as a parameter.  Your parameter function must
   * accept the output of this getter as its 0th input parameter.  If the return
   * type of your pipe parameter includes `undefined`, the return type of the
   * created getter will also include undefined (it will be an optional getter).
   *
   * @example
   * ```ts
   * // Gets the deeply nested `inner` property in a metadata object, or throws
   * // if any step in the pipe is undefined.
   * const assetId1 = getMetadata.pipe(getAssetId).pipe(getInner)(valueView);
   * // Gets the deeply nested `inner` property in a metadata object, or returns
   * // `undefined`.
   * const assetId2 = getMetadata.optional.pipe(getAssetId).pipe(getInner)(valueView);
   * ```
   */
  readonly pipe: <PipeTargetType>(
    pipeSelector:
      | Getter<TargetType, PipeTargetType>
      | ((value?: TargetType | NonNullable<TargetType> | undefined) => PipeTargetType),
  ) => Getter<
    SourceType,
    TargetType extends undefined ? PipeTargetType | undefined : PipeTargetType
  >;
}
