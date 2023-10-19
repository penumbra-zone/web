import { Validation } from '../types/utility';

export const useValidationResult = (
  value: string,
  validations?: Validation[],
): undefined | Validation => {
  if (!validations) return;
  const results = validations.filter(v => v.checkFn(value));
  const error = results.find(v => v.type === 'error');
  return error ? error : results.find(v => v.type === 'warn');
};
