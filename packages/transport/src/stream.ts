/**
 * These classes are used to create stream sources, sinks, and transformers; for
 * composable manipulation of streaming requests and responses.
 *
 * See [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
 *
 * Streams are transferrable objects, simply transported by the standard browser
 * messaging API.
 */

import {
  Any,
  AnyMessage,
  IMessageTypeRegistry,
  JsonValue,
  MessageType,
  createRegistry,
} from '@bufbuild/protobuf';

import { typeRegistry } from '@penumbra-zone/types/src/registry';

/**
 * Packs all messaes to Any and jsonifies with "@type" annotation.
 */
class AnyMessageToJsonTransformer implements Transformer<AnyMessage, JsonValue> {
  transform(chunk: AnyMessage, cont: TransformStreamDefaultController<JsonValue>) {
    const chunkJson = Any.pack(chunk).toJson({ typeRegistry });
    if (!chunkJson) throw Error('Failed to serialize chunk');
    cont.enqueue(chunkJson);
  }
}

export class AnyMessageToJson extends TransformStream<AnyMessage, JsonValue> {
  constructor() {
    super(new AnyMessageToJsonTransformer());
  }
}

class JsonToAnyMessageTransformer implements Transformer<JsonValue, AnyMessage> {
  constructor(private registry: IMessageTypeRegistry) {}
  transform(chunk: JsonValue, controller: TransformStreamDefaultController<AnyMessage>) {
    const message = Any.fromJson(chunk, { typeRegistry: this.registry }).unpack(this.registry);
    if (!message) throw Error('Failed to deserialize chunk');
    controller.enqueue(message);
  }
}

export class JsonToAnyMessage extends TransformStream<JsonValue, AnyMessage> {
  constructor(registry: IMessageTypeRegistry) {
    super(new JsonToAnyMessageTransformer(registry));
  }
}

class JsonToMessageTransformer<M extends AnyMessage> implements Transformer<JsonValue, M> {
  private registry: ReturnType<typeof createRegistry>;
  constructor(private messageType: MessageType) {
    this.registry = createRegistry(messageType);
  }
  transform(chunk: JsonValue, controller: TransformStreamDefaultController) {
    const message = new this.messageType();
    Any.fromJson(chunk, { typeRegistry: this.registry }).unpackTo(message);
    controller.enqueue(message);
  }
}

export class JsonToMessage extends TransformStream<JsonValue, AnyMessage> {
  constructor(messageType: MessageType) {
    super(new JsonToMessageTransformer(messageType));
  }
}

/**
 * These functions are used to transform between streams and iterables.
 *
 * This shouldn't be necessary for very long, as the Streams API now specifies
 * that readable streams should provide Symbol.asyncIterator
 */

export const streamToGenerator = async function* <T>(s: ReadableStream<T>) {
  const r = s.getReader();
  try {
    for (;;) {
      const result = await r.read();
      if (result.done) break;
      else yield result.value;
    }
  } finally {
    r.releaseLock();
  }
};

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
