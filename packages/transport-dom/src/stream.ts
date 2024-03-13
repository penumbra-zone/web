/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
 */

import { Any, AnyMessage, JsonValue, JsonReadOptions, JsonWriteOptions } from '@bufbuild/protobuf';

/**
 * Packs a stream of any registered message to json with "@type" annotation.
 */

export class MessageToJson extends TransformStream<AnyMessage, JsonValue> {
  constructor(jsonOptions: Partial<JsonWriteOptions>) {
    super({
      transform(chunk: AnyMessage, cont: TransformStreamDefaultController<JsonValue>) {
        const chunkJson = Any.pack(chunk).toJson(jsonOptions);
        cont.enqueue(chunkJson);
      },
    });
  }
}

/**
 * Unpacks a stream of json with "@type" annotation to any registered message.
 */

export class JsonToMessage extends TransformStream<JsonValue, AnyMessage> {
  constructor(jsonOptions: Required<JsonReadOptions>) {
    super({
      transform(chunk: JsonValue, cont: TransformStreamDefaultController<AnyMessage>) {
        const message = Any.fromJson(chunk, jsonOptions).unpack(jsonOptions.typeRegistry);
        cont.enqueue(message);
      },
    });
  }
}
