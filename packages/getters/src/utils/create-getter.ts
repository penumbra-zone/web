import { Getter } from './getter';
import { GetterMissingValueError } from './getter-missing-value-error';

export const createGetter = <SourceType, TargetType, Optional extends boolean = false>(
  getterFunction: (value: SourceType | undefined) => TargetType | undefined,
  optional?: Optional,
): Getter<SourceType, TargetType, Optional> => {
  const getter: Getter<SourceType, TargetType, Optional> = value => {
    const result = getterFunction(value);
    if (result === undefined && !optional) {
      const errorMessage = `Failed to extract from ${JSON.stringify(value)}`;
      throw new GetterMissingValueError(errorMessage);
    }
    return result as Optional extends true ? TargetType | undefined : TargetType;
  };

  getter.optional = () =>
    createGetter<SourceType, TargetType, true>(value => {
      try {
        return getterFunction(value);
      } catch (e) {
        if (e instanceof GetterMissingValueError) return undefined;
        else throw e;
      }
    }, true);

  getter.pipe = <PipedTargetType = unknown>(
    next: Getter<TargetType, PipedTargetType, Optional>,
  ) => {
    return createGetter<SourceType, PipedTargetType, Optional>(value => {
      try {
        return next(getterFunction(value));
      } catch (e) {
        if (!optional || !(e instanceof GetterMissingValueError)) throw e;
        else return undefined;
      }
    }, optional);
  };

  return getter;
};
