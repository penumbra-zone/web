import { Getter } from './getter';
import { GetterMissingValueError } from './getter-missing-value-error';

export const createGetter = <SourceType, TargetType, Optional extends boolean = false>(
  getterFunction: (value: SourceType | undefined) => TargetType | undefined,
  optional?: Optional,
): Getter<SourceType, TargetType, Optional> => {
  const getter: Getter<SourceType, TargetType, Optional> = value => {
    const result = getterFunction(value);
    if (typeof result === 'undefined' && !optional) {
      const errorMessage = `Failed to extract from ${JSON.stringify(value)}`;
      throw new GetterMissingValueError(errorMessage);
    }
    return result as Optional extends true ? TargetType | undefined : TargetType;
  };

  getter.optional = () =>
    createGetter<SourceType, TargetType, true>(value => getterFunction(value), true);

  getter.pipe = <PipedTargetType = unknown>(
    next: Getter<TargetType, PipedTargetType, Optional>,
  ) => {
    return createGetter<SourceType, PipedTargetType, Optional>(value => {
      try {
        const result = next(getterFunction(value));
        return result;
      } catch (e) {
        if (!optional || !(e instanceof GetterMissingValueError)) throw e;
        else return undefined;
      }
    }, optional);
  };

  return getter;
};
