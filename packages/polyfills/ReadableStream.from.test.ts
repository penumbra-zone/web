import { describe, expect, test } from 'vitest';
import ReadableStream from './ReadableStream.from';

describe('ReadableStream.from', () => {
  test('should create a readable stream from an array', async () => {
    const stream = ReadableStream.from([1, 2, 3]);
    const reader = stream.getReader();

    await expect(reader.read()).resolves.toEqual({ value: 1, done: false });
    await expect(reader.read()).resolves.toEqual({ value: 2, done: false });
    await expect(reader.read()).resolves.toEqual({ value: 3, done: false });
    await expect(reader.read()).resolves.toEqual({ value: undefined, done: true });
  });

  test('should create a readable stream from a generator function', async () => {
    const stream = ReadableStream.from(
      (function* () {
        yield 1;
        yield 2;
        yield 3;
      })(),
    );
    const reader = stream.getReader();

    await expect(reader.read()).resolves.toEqual({ value: 1, done: false });
    await expect(reader.read()).resolves.toEqual({ value: 2, done: false });
    await expect(reader.read()).resolves.toEqual({ value: 3, done: false });
    await expect(reader.read()).resolves.toEqual({ value: undefined, done: true });
  });
});
