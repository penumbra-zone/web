/* eslint-disable @typescript-eslint/no-explicit-any */
// just a type declaration for chrome's existing Array.fromAsync

type ArrayWithAsync = typeof Array & {
  fromAsync<T, U = T>(
    arrayLike: ArrayLike<T> | AsyncIterable<T>,
    mapfn?: (v: T, k: number) => U,
    thisArg?: any,
  ): Promise<U[]>;
};

export default Array as ArrayWithAsync;
