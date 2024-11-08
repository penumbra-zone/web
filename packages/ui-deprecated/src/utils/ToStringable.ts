/**
 * Utility interface to represent types that can be cast to string. Useful for
 * e.g., accepting an array of `.toString()`-able items will be mapped over, so
 * that the items can have `.toString()` called on them for the React `key`
 * prop.
 */
export interface ToStringable {
  toString: () => string;
}
