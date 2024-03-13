import { beforeEach, describe, expect, test } from 'vitest';

import Array from './Array.fromAsync';

// eslint-disable-next-line @typescript-eslint/unbound-method
const streamToPromise = Array.fromAsync;

describe('streamToPromise()', () => {
  describe('when one of the streamed items throws', () => {
    let error: unknown;
    const query = async function* () {
      yield* [
        await new Promise(() => {
          throw error;
        }),
      ];
    };

    describe('when the thrown value is an instance of `Error`', () => {
      beforeEach(() => {
        error = new Error('oops');
      });

      test('rejects with the error', async () => {
        await expect(streamToPromise(query())).rejects.toThrow(error as Error);
      });
    });

    describe('old streamToPromise behavior that Array.fromAsync does not exhibit', () => {
      describe('when the thrown value is a string', () => {
        beforeEach(() => {
          error = 'oops';
        });

        test.fails("don't reject with the string wrapped in an instance of `Error`", async () => {
          await expect(streamToPromise(query())).rejects.toThrow(new Error('oops'));
        });
      });

      describe('when the thrown value is neither an `Error` instance nor a string', () => {
        beforeEach(() => {
          error = 1n;
        });

        test.fails("don't reject with an unknown error", async () => {
          await expect(streamToPromise(query())).rejects.toThrow(
            new Error('Unknown error in `streamToPromise`'),
          );
        });
      });
    });
  });
});
