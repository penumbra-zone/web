/**
 * Given a value of type `SourceType`, returns a (possibly nested) property of
 * that value, of type `TargetType`. If `Optional` is `true`, returns
 * undefined if the property or an ancestor is undefined; if `false`, throws
 * when the property or an ancestor is undefined.
 */
type GetterFunction<SourceType, TargetType, Optional extends boolean> = (
  value: SourceType | undefined,
) => Optional extends true ? TargetType | undefined : TargetType;

interface GetterMethods<SourceType, TargetType, Optional extends boolean = false> {
  /**
   * Returns a getter that, when given a value of type `SourceType`, returns a
   * (possibly nested) property of that value, of type `TargetType`. If the
   * property or any of its ancestors are undefined, returned undefined.
   *
   * @example
   * ```ts
   * const getMetadata = createGetter<ValueView, Metadata>(valueView =>
   *   valueView?.valueView.case === 'knownAssetId' ? valueView.valueView.value.metadata : undefined,
   * );
   *
   * // Note that `valueView` has no metadata, nor even a `case`.
   * const valueView = new ValueView();
   *
   * // Doesn't throw, even though the metadata is missing.
   * const metadata = getMetadata.optional()(valueView);
   * ```
   */
  optional: () => Getter<SourceType, TargetType, true>;

  /**
   * Pipes the output of this getter to another getter or getter function.
   *
   * @example
   * ```ts
   * // Gets the deeply nested `inner` property in a metadata object, or throws
   * // if any step in the pipe is undefined.
   * const assetId1 = getMetadata.pipe(getAssetId).pipe(getInner)(valueView);
   * // Gets the deeply nested `inner` property in a metadata object, or returns
   * // undefined if any step in the pipe is undefined. Note that `.optional()`
   * // must be called at the _beginning_ of the chain.
   * const assetId2 = getMetadata.optional().pipe(getAssetId).pipe(getInner)(valueView);
   * ```
   */
  pipe: <PipedTargetType = unknown>(
    pipedGetter: Getter<TargetType, PipedTargetType, Optional>,
  ) => Getter<SourceType, PipedTargetType, Optional>;
}

export type Getter<
  SourceType = unknown,
  TargetType = unknown,
  Optional extends boolean = false,
> = GetterFunction<SourceType, TargetType, Optional> &
  GetterMethods<SourceType, TargetType, Optional>;
