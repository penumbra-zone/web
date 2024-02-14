/**
 * These functions are used to transform between streams and iterables.
 *
 * This shouldn't be necessary for very long, as the Streams API specifies
 * readable streams should provide Symbol.asyncIterator
 */

import { ConnectError } from '@connectrpc/connect';

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
