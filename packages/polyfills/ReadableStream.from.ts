// This re-exports ReadableStream with a static method `from`, if the method is
// not already present. Unfortunately typescript's dom library types the global
// `ReadableStream` as a var and not just an interface, so we can't just extend
// and merge the global declarations.

// It doesn't matter for any of our use cases, but notably, there seems to be a
// spec error: Unlike a Generator, a ReadableStream cannot be both 'done' and
// convey a 'value' at the same time, so this should not be used to streamify a
// generator with a return value.

type ReadableStreamFrom = <T>(iterable: Iterable<T> | AsyncIterable<T>) => ReadableStream<T>;

const ReadableStreamWithFrom: typeof ReadableStream & { from: ReadableStreamFrom } =
  'from' in ReadableStream
    ? (ReadableStream as typeof ReadableStream & { from: ReadableStreamFrom })
    : Object.assign(ReadableStream, {
        from<T>(iterable: Iterable<T> | AsyncIterable<T>): ReadableStream<T> {
          if (Symbol.iterator in iterable) {
            const it = iterable[Symbol.iterator]();
            return new ReadableStream({
              pull(cont) {
                const result = it.next();
                if (result.done) cont.close();
                else cont.enqueue(result.value);
              },
            });
          } else if (Symbol.asyncIterator in iterable) {
            const it = iterable[Symbol.asyncIterator]();
            return new ReadableStream({
              async pull(cont) {
                const result = await it.next();
                if (result.done) cont.close();
                else cont.enqueue(result.value);
              },
            });
          } else throw TypeError('Not iterable');
        },
      });

export default ReadableStreamWithFrom;
