import { z, ZodTypeAny } from 'zod';
import { isDevEnv } from './environment';

// Given performance critical nature of some features (like syncing),
// we only validate in dev mode in attempts to catch any schema variance
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  if (isDevEnv()) {
    return schema.parse(data);
  } else {
    return data as T;
  }
};

/**
 * Returns a type predicate that allows safe property access.
 *
 * @example
 * ```TS
 * const visibleAddressViewWithAccountIndexSchema = z.object({
 *   addressView: z.object({
 *     case: z.literal('visible'),
 *     value: z.object({
 *       index: z.object({
 *         account: z.number(),
 *       }),
 *     }),
 *   }),
 * });
 *
 * const addressView = new AddressView();
 *
 * const hasAccountIndex = isType(visibleAddressViewWithAccountIndexSchema);
 *
 * if (hasAccountIndex(addressView)) {
 *   // No need for `?`, `!`, or `case === 'visible'`.
 *   console.log(addressView.addressView.value.index.account);
 * }
 * ````
 *
 * @see https://github.com/colinhacks/zod/issues/2345
 */
export const isType =
  <T extends ZodTypeAny>(schema: T) =>
  (data: unknown): data is z.infer<T> =>
    schema.safeParse(data).success;
