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
