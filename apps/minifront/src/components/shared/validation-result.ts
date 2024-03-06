export interface Validation {
  checkFn: (txt: string) => boolean;
  type: 'warn' | 'error'; // corresponds to red or yellow
  issue: string;
}

export const validationResult = (
  value: string,
  validations?: Validation[],
): undefined | Validation => {
  if (!validations) return;
  const results = validations.filter(v => v.checkFn(value));
  const error = results.find(v => v.type === 'error');
  return error ? error : results.find(v => v.type === 'warn');
};
