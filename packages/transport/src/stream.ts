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
import { ConnectError } from '@connectrpc/connect';

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

/**
 * These functions are used to transform between streams and iterables.
 *
 * This shouldn't be necessary for very long, as the Streams API specifies
 * readable streams should provide Symbol.asyncIterator
 */

export const streamToGenerator = async function* <T>(s: ReadableStream<T>) {
  const r = s.getReader();
  try {
    for (;;) {
      const result = await r.read();
      if (result.done) break;
      else yield result.value;
    }
  } catch (e) {
    throw ConnectError.from(e);
  } finally {
    r.releaseLock();
  }
};

// local iterable type guards for iterableToStream
const isAsyncIterable = <T>(i: unknown): i is AsyncIterable<T> =>
  i != null && typeof i === 'object' && Symbol.asyncIterator in i;
const isIterable = <T>(i: unknown): i is Iterable<T> =>
  i != null && typeof i === 'object' && Symbol.iterator in i;

export const iterableToStream = <T>(iterable: Iterable<T> | AsyncIterable<T>) => {
  let iterator: AsyncIterator<T> | Iterator<T>;
  if (isAsyncIterable(iterable)) iterator = iterable[Symbol.asyncIterator]();
  else if (isIterable(iterable)) iterator = iterable[Symbol.iterator]();
  else throw TypeError('Not iterable');
  return new ReadableStream({
    async pull(cont: ReadableStreamDefaultController<T>) {
      const result = await Promise.resolve(iterator.next());
      if (result.done) cont.close();
      else cont.enqueue(result.value);
    },
  });
};
