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

  test('should create a readable stream from an async generator function', async () => {
    const stream = ReadableStream.from(
      (async function* () {
        let x = 1;
        do {
          yield x++;
          await Promise.resolve();
        } while (x < 4);
      })(),
    );
    const reader = stream.getReader();

    await expect(reader.read()).resolves.toEqual({ value: 1, done: false });
    await expect(reader.read()).resolves.toEqual({ value: 2, done: false });
    await expect(reader.read()).resolves.toEqual({ value: 3, done: false });
    await expect(reader.read()).resolves.toEqual({ value: undefined, done: true });
  });

  test('should surface errors from a generator function', async () => {
    const stream = ReadableStream.from(
      (function* () {
        yield 1;
        yield 2;
        throw new Error('test');
        // @ts-expect-error - this will be unreachable
        yield 3;
      })(),
    );
    const reader = stream.getReader();

    await expect(reader.read()).resolves.toEqual({ value: 1, done: false });
    await expect(reader.read()).resolves.toEqual({ value: 2, done: false });
    await expect(reader.read()).rejects.toThrow('test');
    await expect(reader.read()).rejects.toThrow('test');
  });

  test('should surface errors from an async generator function', async () => {
    const stream = ReadableStream.from(
      (async function* () {
        yield 1;
        await Promise.resolve();
        yield 2;
        await Promise.reject('hmmm');
        yield 3;
      })(),
    );
    const reader = stream.getReader();

    await expect(reader.read()).resolves.toEqual({ value: 1, done: false });
    await expect(reader.read()).resolves.toEqual({ value: 2, done: false });
    await expect(reader.read()).rejects.toThrow('hmmm');
  });
});

describe('ReadableStream cannot handle a return value', async () => {
  test('generator can end with a returned value', async () => {
    const gen = (function* () {
      yield 1;
      yield 2;
      return 3;
    })();

    expect(gen.next()).toEqual({ value: 1, done: false });
    expect(gen.next()).toEqual({ value: 2, done: false });
    expect(gen.next()).toEqual({ value: 3, done: true });
    expect(gen.next()).toEqual({ value: undefined, done: true });
  });

  test('ReadableStream eats a return value', async () => {
    const stream = ReadableStream.from(
      (function* () {
        yield 1;
        yield 2;
        return 3;
      })(),
    );
    const reader = stream.getReader();

    await expect(reader.read()).resolves.toEqual({ value: 1, done: false });
    await expect(reader.read()).resolves.toEqual({ value: 2, done: false });
    await expect(reader.read()).resolves.toEqual({ value: undefined, done: true });
  });
});
