/**
 * This error will be thrown when a getter that isn't called `optional` returns
 * `undefined`. You can import this error class in your code to differentiate
 * between this specific type of error and others.
 *
 * If you want to catch this error just to suppress it, it's easier to just call
 * the getter as `optional` instead.
 *
 * `getAddressIndex.optional(addressView)`.)
 */
export class GetterMissingValueError extends Error {}
