import { Getter } from './getter';

export const createGetter = <SourceType, TargetType>(
  getterFunction: (value: SourceType | undefined) => TargetType | undefined,
): Getter<SourceType, TargetType> => {
  const getter: Getter<SourceType, TargetType> = value => getterFunction(value);

  getter.orThrow = (value, errorMessage) => {
    const result = getterFunction(value);
    if (!result) throw new Error(errorMessage);
    return result;
  };

  getter.pipe = next => createGetter(value => next(getterFunction(value)));

  return getter;
};
