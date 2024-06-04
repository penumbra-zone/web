import { JsonValue, JsonWriteOptions, PartialMessage, Timestamp } from '@bufbuild/protobuf';

export function patchTimestampToJson<T = unknown>(
  // timestamps from cometbft are out of spec. we must respect this
  // @see https://github.com/bufbuild/protobuf-es/blob/14c00183c331998c26841aa83c05ca68517f3b14/packages/protobuf/src/google/protobuf/timestamp_pb.ts#L169-L189
  this: ThisParameterType<T> & PartialMessage<Timestamp>,
  _?: Partial<JsonWriteOptions>,
): JsonValue {
  const ms = (this.seconds ?? 0n) * 1000n;
  if (ms < Date.parse('0001-01-01T00:00:00Z') || ms > Date.parse('9999-12-31T23:59:59Z')) {
    throw new Error(
      `cannot encode google.protobuf.Timestamp to JSON: must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive`,
    );
  }
  /*
    if (this.nanos < 0) {
      throw new Error(
        `cannot encode google.protobuf.Timestamp to JSON: nanos must not be negative`,
      );
    }
    */
  let z = 'Z';
  if (Number(this.nanos) > 0) {
    const nanosStr = (Number(this.nanos) + 1000000000).toString().substring(1);
    if (nanosStr.substring(3) === '000000') {
      z = '.' + nanosStr.substring(0, 3) + 'Z';
    } else if (nanosStr.substring(6) === '000') {
      z = '.' + nanosStr.substring(0, 6) + 'Z';
    } else {
      z = '.' + nanosStr + 'Z';
    }
  }
  return new Date(Number(ms)).toISOString().replace('.000Z', z);
}
