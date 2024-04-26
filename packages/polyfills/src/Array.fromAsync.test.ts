import { expect, describe, it } from 'vitest';

import Array from './Array.fromAsync';
import './ReadableStream_Symbol.asyncIterator_';

describe('Array.fromAsync', () => {
  it('should convert an async iterable to an array', async () => {
    const asyncIterable = {
      [Symbol.asyncIterator]: async function* () {
        await Promise.resolve();
        yield 1;
        yield 2;
        yield 3;
      },
    };

    const result = await Array.fromAsync(asyncIterable);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should apply a map function to each element of the async iterable', async () => {
    const asyncIterable = {
      [Symbol.asyncIterator]: async function* () {
        await Promise.resolve();
        yield 1;
        yield 2;
        yield 3;
      },
    };

    const mapFn = (value: number) => value * 2;

    const result = await Array.fromAsync(asyncIterable, mapFn);
    expect(result).toEqual([2, 4, 6]);
  });

  it('should apply a map function with a thisArg to each element of the async iterable', async () => {
    const asyncIterable = {
      [Symbol.asyncIterator]: async function* () {
        await Promise.resolve();
        yield 1;
        yield 2;
        yield 3;
      },
    };

    const objWithMapFn = {
      multiplier: 3,
      mapFn(value: number) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return value * this.multiplier;
      },
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method -- this is what we're testing
    const result = await Array.fromAsync(asyncIterable, objWithMapFn.mapFn, { multiplier: 22 });
    expect(result).toEqual([22, 44, 66]);
  });

  it('should convert a stream into an array', async () => {
    const stream = new ReadableStream<number>({
      start(controller) {
        controller.enqueue(1);
        controller.enqueue(2);
        controller.enqueue(3);
        controller.close();
      },
    });

    const result = await Array.fromAsync(stream);
    expect(result).toEqual([1, 2, 3]);
  });
});
