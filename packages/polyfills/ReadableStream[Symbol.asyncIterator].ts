// ReadableStreams are supposed to be async iterables, but chrome has failed to
// ship the patches. This polyfill replaces `streamToGenerator` formerly in
// `stream.ts` It's close to release, so we should be able to remove soon.
// https://chromium-review.googlesource.com/c/chromium/src/+/5263918/11

ReadableStream.prototype[Symbol.asyncIterator] ??= async function* () {
  const reader = this.getReader();
  try {
    for (;;) {
      const result = await reader.read();
      if (result.done) return;
      else yield result.value;
    }
  } finally {
    reader.releaseLock();
  }
};

declare global {
  interface ReadableStream<R> extends AsyncIterable<R> {
    [Symbol.asyncIterator](): AsyncIterableIterator<R>;
  }
}

export {};
