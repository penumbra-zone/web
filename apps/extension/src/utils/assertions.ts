export const isEmptyObj = <T>(input: T): boolean => {
  if (typeof input === 'object' && input !== null) {
    return Object.keys(input).length === 0;
  }
  return false;
};
