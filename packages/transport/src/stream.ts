/**
 * These classes are used to create stream sources, sinks, and transformers; for
 * composable manipulation of streaming requests and responses.
 *
 * See [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
 *
 * Streams are transferrable objects, simply transported by the standard browser
 * messaging API. Streams cannot transport through the chrome runtime, so
 * adapters are available in `./chrome-runtime/stream.ts`
 */

import { Any, AnyMessage, JsonValue, JsonReadOptions, JsonWriteOptions } from '@bufbuild/protobuf';

/**
 * Packs any registered message to json with "@type" annotation.
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
 * Unpacks json with "@type" annotation to any registered message.
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
