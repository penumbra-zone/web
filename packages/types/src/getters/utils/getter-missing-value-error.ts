/**
 * This error will be thrown when a getter that hasn't been marked `.optional()`
 * returns `undefined`. You can import this error class in your code to
 * differentiate between this specific type of error and others. (If you want to
 * catch this error just to make a getter optional, though, it's easier to just
 * call `.optional()` on the getter first:
 * `getAddressIndex.optional()(addressView)`.)
 */
export class GetterMissingValueError extends Error {}
