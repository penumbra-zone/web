/* eslint-disable @typescript-eslint/no-explicit-any -- Message<any> cannot be pre-determined */

import { Message, isMessage, JsonValue } from '@bufbuild/protobuf';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

interface SerializedProto {
  proto: string;
  value: JsonValue;
}

// Type utility to serialize message fields to strings
export type Serialized<T> =
  T extends Message<any>
    ? SerializedProto
    : T extends object
      ? { [KEY in keyof T]: Serialized<T[KEY]> }
      : T;

/** Serializes an object with Protobuf values, turning them into `JsonValue` */
export const serialize = <VAL>(value: VAL): Serialized<VAL> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Value must be an object');
  }

  const obj = {} as Record<string, unknown>;
  for (const key in value) {
    const val = value[key];
    if (isMessage(val)) {
      // @ts-ignore
      obj[key] = { proto: val.getType().typeName, value: val.toJSON() };
    } else {
      obj[key] = val;
    }
  }

  return obj as Serialized<VAL>;
};

const ProtosByType = {
  'penumbra.core.asset.v1.ValueView': ValueView,
  'penumbra.core.asset.v1.Metadata': Metadata,
} as const;

const deserializeProto = (value: SerializedProto): Message<any> => {
  try {
    const proto = ProtosByType[value.proto as keyof typeof ProtosByType];
    return proto.fromJson(value.value);
  } catch (_) {
    throw new Error(
      `Cannot deserialize ${value.proto}. Add its definition to the 'ProtosByType' object.`,
    );
  }
};

const isSerializedProto = (value: unknown): value is SerializedProto => {
  return !!(value as SerializedProto | undefined)?.proto;
};

/**
 * Deserializes an object with serialized Protobufs.
 * Use it on `Serialized<T>` types
 */
export const deserialize = <VAL>(value: Serialized<VAL>): VAL => {
  const obj = {} as Record<string, unknown>;

  for (const key in value) {
    const val = value[key];
    if (isSerializedProto(val)) {
      obj[key] = deserializeProto(val);
    } else {
      obj[key] = val;
    }
  }
  return obj as VAL;
};
