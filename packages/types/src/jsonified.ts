import type { JsonValue } from '@bufbuild/protobuf';

// @ts-expect-error Meant to be a marker to indicate it's json serialized.
//                  Protobuf values often need to be as they are json-deserialized in the wasm crate.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Jsonified<T> = JsonValue;
