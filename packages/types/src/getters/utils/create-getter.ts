import { Getter } from './getter';

export const createGetter = <SourceType, TargetType, AllowsUndefined extends boolean = true>(
  getterFunction: (
    value: SourceType | undefined,
  ) => AllowsUndefined extends true ? TargetType | undefined : TargetType,
): Getter<SourceType, TargetType, AllowsUndefined> => {
  const getter: Getter<SourceType, TargetType, AllowsUndefined> = value => getterFunction(value);

  getter.orThrow = errorMessage => {
    const getOrThrow = createGetter<SourceType, TargetType, false>(value => {
      const result = getterFunction(value);
      if (typeof result === 'undefined') throw new Error(errorMessage);
      return result;
    });

    return getOrThrow;
  };

  getter.pipe = next => createGetter(value => next(getterFunction(value)));

  return getter;
};
