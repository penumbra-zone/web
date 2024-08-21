import { Getter } from './getter.js';
import { GetterMissingValueError } from './getter-missing-value-error.js';

const createPiper =
  <PipeSourceType, IntermediateType>(firstSelector: (s?: PipeSourceType) => IntermediateType) =>
  <PipeTargetType>(
    secondSelector: (i?: IntermediateType) => PipeTargetType,
  ): Getter<PipeSourceType, PipeTargetType> => {
    const pipedFn = (source?: PipeSourceType) => {
      const intermediate: IntermediateType = firstSelector(source);
      const target: PipeTargetType = secondSelector(intermediate);
      return target;
    };

    const pipedGetter = Object.defineProperties(pipedFn, {
      pipe: {
        enumerable: true,
        get() {
          return createPiper(pipedFn);
        },
      },
      optional: {
        enumerable: true,
        get() {
          return createOptional(pipedFn);
        },
      },
      required: {
        enumerable: true,
        get() {
          return createRequired(pipedFn);
        },
      },
    }) as Getter<PipeSourceType, PipeTargetType>;

    return pipedGetter;
  };

const createOptional = <SourceType, TargetType>(
  selector: (v?: SourceType) => TargetType | undefined,
): Getter<SourceType, TargetType | undefined> => {
  const optionalFn = (source?: SourceType) => {
    try {
      return selector(source);
    } catch (e) {
      if (e instanceof GetterMissingValueError) {
        return undefined;
      }
      throw e;
    }
  };

  const optionalGetter = Object.defineProperties(optionalFn, {
    pipe: {
      enumerable: true,
      value: <NextTargetType>(nextSelector: (i?: TargetType) => NextTargetType) => {
        return createPiper(optionalFn)(nextSelector).optional;
      },
    },
    required: {
      enumerable: true,
      get() {
        return createRequired(selector);
      },
    },
  }) as Getter<SourceType, TargetType | undefined>;

  Object.defineProperty(optionalGetter, 'optional', {
    enumerable: true,
    get() {
      return optionalGetter;
    },
  });

  return optionalGetter;
};

const createRequired = <SourceType, TargetType>(
  selector: (v?: SourceType) => TargetType | undefined,
): Getter<SourceType, NonNullable<TargetType>> => {
  const requiredFn = (source?: SourceType) => {
    const required = selector(source);
    if (required == null) {
      throw new GetterMissingValueError(
        `Failed to select value from "${String(source)}" with "${selector.name}"`,
        { cause: { source, selector } } satisfies ErrorOptions,
      );
    }
    return required;
  };

  const requiredGetter = Object.defineProperties(requiredFn, {
    pipe: {
      enumerable: true,
      get() {
        return createPiper(requiredFn);
      },
    },
    optional: {
      enumerable: true,
      get() {
        return createOptional(selector);
      },
    },
  }) as Getter<SourceType, NonNullable<TargetType>>;

  Object.defineProperty(requiredGetter, 'required', {
    enumerable: true,
    get() {
      return requiredGetter;
    },
  });

  return requiredGetter;
};

export { createRequired as createGetter };
