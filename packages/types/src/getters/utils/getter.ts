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
   * property or any of its ancestors are undefined, throws an error (optionally
   * set to `errorMessage`).
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
   * // Throws a `No metadata!` error due to the lack of metadata.
   * const metadata = getMetadata.orThrow('No metadata!')(valueView);
   * ```
   */
  optional: () => Getter<SourceType, TargetType, true>;

  /**
   * Pipes the output of this getter to another getter or getter function.
   *
   * @example
   * ```ts
   * // This will throw if any step along the way returns `undefined`.
   * const assetId1 = getMetadata.pipe(getAssetId).pipe(getInner).orThrow()(valueView);
   * // This will throw only if the asset ID specifically is missing.
   * const assetId2 = getMetadata.pipe(getAssetId.orThrow()).pipe(getInner)(valueView);
   * // This won't throw at all -- it will just return `undefined` if any step
   * // along the way is `undefined`.
   * const assetId3 = getMetadata.pipe(getAssetId).pipe(getInner)(valueView);
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
