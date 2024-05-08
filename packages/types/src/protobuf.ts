import { Any, Message } from '@bufbuild/protobuf';
import { typeRegistry } from '@penumbra-zone/protobuf';

/**
 * When converting a type name to a type URL, you simply add a leading slash.
 * This little helper allows you to pass the type URL of a Protobuf object, and
 * the typename of a Protobuf class, to compare them. Useful when working with
 * `Any`s.
 *
 * @see https://github.com/tokio-rs/prost/blob/215ae16/prost/src/name.rs#L27-L33
 */
export const typeUrlMatchesTypeName = (typeUrl?: string, typeName?: string): typeUrl is string =>
  typeUrl !== undefined && typeName !== undefined && typeUrl === `/${typeName}`;

/**
 * Once you've established which Protobuf type an `Any` is, you can unpack the
 * `Any` into that type using this helper.
 *
 * @example
 *
 * ```ts
 * const dutchAuction = unpackAny(DutchAuction, someAnyValue);
 * // `dutchAuction` is of type `DutchAuction | undefined`
 * ```
 */
export const unpackAny = <T extends Message<T>>(
  any: Any,
  ProtobufClass: new () => T,
): T | undefined => {
  // const message = new ProtobufClass();
  // if (any.unpackTo(message)) return message;

  const result = any.unpack(typeRegistry);

  if (result?.getType().equals(ProtobufClass)) return result;
  return undefined;

  // return undefined;
};
