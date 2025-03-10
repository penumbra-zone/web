/** Attempt to parse a string into a number, returning `undefined` on failure. */
export const parseNumber = (x: string): number | undefined => {
  const out = Number(x);
  return isNaN(out) || x.length <= 0 ? undefined : out;
};
