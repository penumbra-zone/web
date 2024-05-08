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
