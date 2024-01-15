import type { JsonValue, Message, PlainMessage } from '@bufbuild/protobuf';

export type Jsonified<T> = T extends JsonValue
  ? T
  : {
      // eslint-disable-next-line @typescript-eslint/ban-types -- we're just deleting this fn, it doesn't matter
      [P in keyof T as T[P] extends Function ? never : P]: JsonField<T[P]>;
    };

// prettier-ignore
type JsonField<F> = F extends (JsonValue) ? F
                  : F extends (Date| Uint8Array | bigint) ? string
                  : F extends (infer U)[] ? JsonField<U>[]
                  : F extends Message<infer U> ? Jsonified<PlainMessage<U>>
                  : F extends object ? Jsonified<F>
                  : F;
