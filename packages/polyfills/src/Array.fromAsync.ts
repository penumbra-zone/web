// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./array-from-async.d.ts" />
import fromAsync from 'array-from-async';

type FromAsync = <T, U = T>(
  arrayLike: ArrayLike<T> | AsyncIterable<T>,
  mapfn?: (v: T, k: number) => U,
  thisArg?: unknown,
) => Promise<U[]>;

type ArrayWithFromAsync = typeof Array & { fromAsync: FromAsync };

if (!('fromAsync' in Array)) {
  Object.assign(Array, { fromAsync: fromAsync as FromAsync });
}

export default Array as ArrayWithFromAsync;
