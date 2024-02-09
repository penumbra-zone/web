/**
 * Given a value of type `SourceType`, returns a (possibly nested) property of
 * that value, of type `TargetType`. Returns undefined if the property or any
 * of its ancestors are undefined.
 */
type GetterFunction<SourceType, TargetType> = (
  value: SourceType | undefined,
) => TargetType | undefined;

export type Getter<SourceType = unknown, TargetType = unknown> = GetterFunction<
  SourceType,
  TargetType
> & {
  /**
   * Given a value of type `SourceType`, returns a (possibly nested) property of
   * that value, of type `TargetType`. If the property or any of its ancestors
   * are undefined, throws an error (optionally set to `errorMessage`).
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
   * const metadata = getMetadata.orThrow(valueView, 'No metadata!');
   * ```
   */
  orThrow: (
    value: SourceType | undefined,

    /** The error message to throw if the target is undefined. */
    errorMessage?: string,
  ) => TargetType;

  /**
   * Pipes the output of this getter to another getter or getter function.
   *
   * @example
   * ```ts
   * // This will throw if any step along the way returns `undefined`.
   * const assetId1 = getMetadata.pipe(getAssetId).pipe(getInner).orThrow(valueView);
   * // This will throw only if the asset ID specifically is missing.
   * const assetId2 = getMetadata.pipe(getAssetId.orThrow).pipe(getInner)(valueView);
   * // This won't throw at all -- it will just return `undefined` if any step
   * // along the way is `undefined`.
   * const assetId3 = getMetadata.pipe(getAssetId).pipe(getInner)(valueView);
   * ```
   */
  pipe: <PipedTargetType = unknown>(
    getterFunction: GetterFunction<TargetType, PipedTargetType>,
  ) => Getter<SourceType, PipedTargetType>;
};
