export type EmptyObject = Record<string, never>;

export const isEmptyObj = <T>(input: T): input is T & EmptyObject => {
  if (typeof input === 'object' && input !== null) {
    return Object.keys(input).length === 0;
  }
  return false;
};

export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, letter => `_${letter}`).toLowerCase();
