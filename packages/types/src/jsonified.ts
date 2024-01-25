import type { JsonValue, JsonObject, AnyMessage } from '@bufbuild/protobuf';

export const isJsonObject = (res: unknown): res is JsonObject =>
  res != null &&
  typeof res === 'object' &&
  !Array.isArray(res) &&
  Object.keys(res).every(k => typeof k === 'string') &&
  Object.values(res).every(isJsonValue);

export const isJsonArray = (res: unknown): res is JsonValue[] =>
  res != null && Array.isArray(res) && res.every(isJsonValue);

export const isJsonValue = (res: unknown): res is JsonValue =>
  res === null ||
  typeof res === 'string' ||
  typeof res === 'number' ||
  typeof res === 'boolean' ||
  isJsonObject(res) ||
  isJsonArray(res);

/**
 * This is used to suggest the purpose of a string to a human. It provides no
 * actual type assistance.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Stringified<J> = Jsonified<J> extends JsonValue ? string : never;

/**
 * This is used to approximate a json-compatible version of a type. Mostly, it
 * is for *suggesting* what a parameter or return *should* represent, *to a
 * human*. It performs no actual data conversion, and makes assumptions about
 * how some json-incompatible types will be converted.
 *
 * Our idb schema uses it for identifying key/index types generated from stored
 * object fields.
 *
 * It's based on PlainMessage from `@bufbuild/protobuf`, but notably we treat
 * any `Message<T>` as a black-box `JsonObject`, to avoid the complex and
 * configurable details of protojson.
 *
 * - members of `JsonValue` are directly equivalent
 * - `Date`, `Uint8Array`, and `bigint` are assumed to stringify
 * - Arrays are recursively Jsonified.
 * - `AnyMessage` becomes generic `JsonObject`
 * - other objects maintain structure, and filter out functions
 */
// prettier-ignore
export type Jsonified<T> = T extends JsonValue ? T                          // JsonValue members equivalent
                         : T extends (Date | Uint8Array | bigint) ? string  // these types stringify
                         : T extends (infer U)[] ? Jsonified<U>[]           // recurse into array members
                         : T extends AnyMessage ? JsonObject                // AnyMessage is a black box
                         : T extends object ? {                             // any object...
                            [P in keyof T as                                // ...index into...
                              // eslint-disable-next-line @typescript-eslint/ban-types
                              T[P] extends (Function) ? never               // ...strip function members
                            : P extends string ? P                          // ...keep string keys
                            : P extends number ? `${P}`                     // ...stringify number keys
                            : never                                         // ...strip symbol keys
                            ]: Jsonified<T[P]>;                             // ...recurse object members
                          } 
                         : T extends undefined ? never : T; // undefined not allowed
