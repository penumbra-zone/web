import type { JsonValue, JsonObject, AnyMessage } from '@bufbuild/protobuf';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Stringified<J> = J extends Jsonified<infer _T> ? string : never;

// prettier-ignore
export type Jsonified<T> = T extends JsonValue ? T
                         : T extends (Date | Uint8Array | bigint) ? string
                         : T extends (infer U)[] ? Jsonified<U>[]
                         : T extends AnyMessage ? JsonObject
                         : T extends object ? {
                            [P in keyof T as
                              // eslint-disable-next-line @typescript-eslint/ban-types
                              T[P] extends (Function) ? never
                            : P extends string ? P
                            : P extends number ? `${P}`
                            : never
                            ]: Jsonified<T[P]>;
                          } 
                         : T extends undefined ? never : T;
