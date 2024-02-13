import { describe, expect, it } from 'vitest';
import { rethrowImplErrors } from './rethrow-impl-errors';
import { ConnectError } from '@connectrpc/connect';

const mockServiceImplementation = {
  getFoos: async (errorToThrow?: Error) => {
    if (errorToThrow) throw errorToThrow;
    return Promise.resolve(['foo1', 'foo2']);
  },
  getBars: async function* (errorToThrow?: Error) {
    if (errorToThrow) throw errorToThrow;
    const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
    for await (const i of promises) {
      yield i;
    }
  },
} satisfies Record<string, (error?: Error) => unknown>;

describe('rethrowImplErrors()', () => {
  describe('for a unary method', () => {
    describe('when the impl throws a `ConnectError`', () => {
      it('throws the error as-is', async () => {
        const wrappedServiceImplementation = rethrowImplErrors(mockServiceImplementation);
        const error = new ConnectError('oh no!');

        await expect(() => wrappedServiceImplementation.getFoos(error)).rejects.toThrow(error);
      });
    });

    describe('when the impl throws an error that is not a `ConnectError`', () => {
      it('throws the error as a `ConnectError`', async () => {
        const wrappedServiceImplementation = rethrowImplErrors(mockServiceImplementation);
        const error = new Error('oh no!');

        await expect(() => wrappedServiceImplementation.getFoos(error)).rejects.toThrow(
          new ConnectError('oh no!'),
        );
      });
    });
  });

  describe('for a streaming method', () => {
    describe('when the impl throws a `ConnectError`', () => {
      it('throws the error as-is', async () => {
        const wrappedServiceImplementation = rethrowImplErrors(mockServiceImplementation);
        const error = new ConnectError('oh no!');

        await expect(async () => {
          for await (const item of wrappedServiceImplementation.getBars(error)) {
            // no-op
            item;
          }
        }).rejects.toThrow(error);
      });
    });

    describe('when the impl throws an error that is not a `ConnectError`', () => {
      it('throws the error as a `ConnectError`', async () => {
        const wrappedServiceImplementation = rethrowImplErrors(mockServiceImplementation);
        const error = new Error('oh no!');

        await expect(async () => {
          for await (const item of wrappedServiceImplementation.getBars(error)) {
            // no-op
            item;
          }
        }).rejects.toThrow(new ConnectError('oh no!'));
      });
    });
  });
});
