/**
 * By default, protobufs make all primitive types required and all
 * other fields optional. This often does not match the intention
 * of how the code will be used. These utility helpers exist to assist
 * in changing field optional indicators.
 */

/**
 * `ProtoOverride` is a utility type that takes two type arguments,
 * `Original` and `Override`. It intersects the `Original` type with a mapped
 * type that overrides the properties of `Original` specified in `Override`.
 *
 * @typeParam Original - The original type that we want to modify
 * @typeParam Override - The type that contains the properties we want to override in `Original`
 *
 * @example
 *
 * type Original = { a?: number; b: string };
 * type Override = { a: number };
 *
 * type Result = ProtoOverride<Original, Override>;
 * // => { a: number; b: string }
 */
export type ProtoOverride<Original extends object, Override> = Original & {
  [K in Extract<keyof Override, keyof Original>]: Override[K];
};

/**
 * `PartialFields` is a utility type that makes all keys required except for the ones you specify.
 *
 * @typeParam T - The original type that we want to modify.
 * @typeParam K - The keys that we want to make optional.
 *
 * @example
 *
 * type Original = { x: number; y: string };*
 * type Result = PartialFields<Original, 'a'>;
 * // => { x?: number; y: string }
 */
export type PartialFields<T, K extends keyof T> = Partial<Pick<T, K>> & Required<Omit<T, K>>;
