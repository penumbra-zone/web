import { describe, expect, test } from 'vitest';
import './ReadableStream[Symbol.asyncIterator]';

describe('ReadableStream[Symbol.asyncIterator]', () => {
  test('ReadableStream contains Symbol.asyncIterator', () => {
    expect(Symbol.asyncIterator in ReadableStream.prototype).toBe(true);
  });

  test('ReadableStream can be iterated with `for await`', async () => {
    const stream = new ReadableStream<number>({
      start(controller) {
        controller.enqueue(1);
        controller.enqueue(2);
        controller.enqueue(3);
        controller.close();
      },
    });

    const values = [];
    for await (const value of stream) values.push(value);
    expect(values).toEqual([1, 2, 3]);
  });

  test("ReadableStream can't be iterated with synchronous `for`", () => {
    const stream = new ReadableStream<number>({
      start(controller) {
        controller.enqueue(1);
        controller.enqueue(2);
        controller.enqueue(3);
        controller.close();
      },
    });

    const values = [];
    try {
      // @ts-expect-error - this should be an error
      for (const value of stream) values.push(value);
    } catch (e) {
      expect(e).toBeInstanceOf(TypeError);
    }
  });

  test('ReadableStream can be yielded to by an async generator', async () => {
    async function* genFn() {
      yield* new ReadableStream<number>({
        start(controller) {
          controller.enqueue(1);
          controller.enqueue(2);
          controller.enqueue(3);
          controller.close();
        },
      });
    }

    const values = [];
    for await (const value of genFn()) values.push(value);
    expect(values).toEqual([1, 2, 3]);
  });

  test("ReadableStream can't be yielded to by a synchronous generator", async () => {
    function* genFn() {
      // @ts-expect-error - this should be an error
      yield* new ReadableStream<number>({
        start(controller) {
          controller.enqueue(1);
          controller.enqueue(2);
          controller.enqueue(3);
          controller.close();
        },
      });
    }
    expect(genFn()).toThrow(TypeError);
  });
});
