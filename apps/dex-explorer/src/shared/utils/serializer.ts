/* eslint-disable @typescript-eslint/no-explicit-any -- Message<any> cannot be pre-determined */

import { Message, isMessage, JsonValue } from '@bufbuild/protobuf';
import {
  AssetId,
  Metadata,
  Value,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DirectedTradingPair } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

interface SerializedProto {
  proto: string;
  value: JsonValue;
}

// Type utility to serialize message fields to strings
export type Serialized<T> =
  T extends Message<any>
    ? SerializedProto
    : T extends Date | Error
      ? string
      : T extends object
        ? { [KEY in keyof T]: Serialized<T[KEY]> }
        : T;

/** Serializes an object with Protobuf values, turning them into `JsonValue` */
export const serialize = <VAL>(value: VAL): Serialized<VAL> => {
  if (typeof value !== 'object' || value === null) {
    return value as Serialized<VAL>;
  }

  if (Array.isArray(value)) {
    return value.map(v => serialize(v) as Serialized<unknown>) as Serialized<VAL>;
  }

  if (value instanceof Date) {
    return value.toString() as Serialized<VAL>;
  }

  if (value instanceof Error) {
    return value.toString() as Serialized<VAL>;
  }

  if (isMessage(value)) {
    return {
      proto: value.getType().typeName,
      value: value.toJson(),
    } as Serialized<VAL>;
  }

  const obj = {} as Record<string, unknown>;
  for (const key in value) {
    const val = value[key];
    obj[key] = serialize(val);
  }

  return obj as Serialized<VAL>;
};

const ProtosByType = {
  'penumbra.core.asset.v1.ValueView': ValueView,
  'penumbra.core.asset.v1.Metadata': Metadata,
  'penumbra.core.asset.v1.Value': Value,
  'penumbra.core.asset.v1.AssetId': AssetId,
  'penumbra.core.component.dex.v1.DirectedTradingPair': DirectedTradingPair,
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

export const deserialize = <VAL>(value: Serialized<VAL>): VAL => {
  if (typeof value !== 'object' || value === null) {
    return value as VAL;
  }

  if (Array.isArray(value)) {
    return value.map(v => deserialize(v) as unknown) as VAL;
  }

  if (isSerializedProto(value)) {
    return deserializeProto(value) as VAL;
  }

  const obj = {} as Record<string, unknown>;
  for (const key in value) {
    const val = value[key];
    obj[key] = deserialize(val as Serialized<unknown>);
  }

  return obj as VAL;
};
