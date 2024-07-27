/**
 * This error will be thrown when a getter that hasn't been marked `.optional()`
 * returns `undefined`. You can import this error class in your code to
 * differentiate between this specific type of error and others. (If you want to
 * catch this error just to make a getter optional, though, it's easier to just
 * call `.optional()` on the getter first:
 * `getAddressIndex.optional()(addressView)`.)
 */
export class GetterMissingValueError extends Error {}

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
   * Returns a getter of type `Getter<SourceType, TargetType | undefined>`
   * that will avoid throwing if the property is not available.
   *
   * @example
   * ```ts
   * const getMetadataFromValueView = createGetter<ValueView, Metadata>(valueView =>
   *   valueView?.valueView.case === 'knownAssetId' ? valueView.valueView.value.metadata : undefined,
   * );
   *
   * // Note that `valueView` has no metadata, nor even a `case`.
   * const valueView = new ValueView();
   *
   * // Doesn't throw, even though the metadata is missing.
   * const metadata = getMetadataFromValueView.optional()(valueView);
   * ```
   */
  optional: () => Getter<SourceType, TargetType | undefined>;

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
  pipe: <PipeTargetType>(
    pipeSelector:
      | Getter<TargetType, PipeTargetType>
      | ((value?: TargetType | NonNullable<TargetType> | undefined) => PipeTargetType),
  ) => Getter<
    SourceType,
    TargetType extends undefined ? PipeTargetType | undefined : PipeTargetType
  >;
}

const requiredValueFn = <S, T>(fn: (v?: S) => T) => {
  return (v?: S) => {
    const r = fn(v);
    if (r != null) {
      return r;
    }
    throw new GetterMissingValueError(`Failed to extract from ${JSON.stringify(v)}`);
  };
};

const possibleValueFn = <S, T>(fn: (v?: S) => T) => {
  return (v?: S) => {
    try {
      return fn(v);
    } catch (e) {
      if (e instanceof GetterMissingValueError) {
        return;
      }
      throw e;
    }
  };
};

const pipedValueFn =
  <S, I, T>(inFn: (sv?: S) => I, outFn: (iv?: I) => T) =>
  (v?: S) =>
    outFn(inFn(v));

const createPiper =
  <PipeSourceType, IntermediateType>(selector: (sv?: PipeSourceType) => IntermediateType) =>
  <PipeTargetType>(pipeSelector: (iv?: IntermediateType) => PipeTargetType) => {
    const pipedFn = pipedValueFn(selector, pipeSelector);

    const pipedGetter = Object.assign(pipedFn, {
      optional() {
        return createOptional(pipedFn);
      },

      pipe<NextPipeTargetType>(nextPipeSelector: (tv?: PipeTargetType) => NextPipeTargetType) {
        return createPiper(pipedFn)(nextPipeSelector);
      },
    });

    return pipedGetter;
  };

const createOptional = <SourceType, TargetType>(
  selector: (v?: SourceType) => TargetType | undefined,
): Getter<SourceType, TargetType | undefined> => {
  const optionalFn = possibleValueFn(selector);

  const optionalGetter = Object.assign(optionalFn, {
    optional() {
      return optionalGetter;
    },

    pipe<PipeTargetType>(pipeSelector: (tv?: TargetType | undefined) => PipeTargetType) {
      return createPiper(optionalFn)(pipeSelector).optional();
    },
  });

  return optionalGetter;
};

const createRequired = <SourceType, TargetType>(
  selector: (v?: SourceType) => TargetType | undefined,
): Getter<SourceType, NonNullable<TargetType>> => {
  const requiredFn = requiredValueFn(selector);

  const requiredGetter = Object.assign(requiredFn, {
    optional() {
      return createOptional<SourceType, NonNullable<TargetType> | undefined>(requiredFn);
    },

    pipe<PipeTargetType>(
      pipeSelector: (tv?: NonNullable<TargetType>) => PipeTargetType,
    ): Getter<SourceType, PipeTargetType> {
      return createPiper(requiredFn)(pipeSelector);
    },
  });

  return requiredGetter;
};

export const createGetter = createRequired;
