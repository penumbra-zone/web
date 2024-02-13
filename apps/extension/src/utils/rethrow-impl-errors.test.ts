import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rethrowImplErrors } from './rethrow-impl-errors';
import { ConnectError, HandlerContext, ServiceImpl } from '@connectrpc/connect';
import {
  AnyMessage,
  BinaryReadOptions,
  FieldList,
  JsonReadOptions,
  JsonValue,
  Message,
  MethodKind,
  PlainMessage,
  ServiceType,
  proto3,
} from '@bufbuild/protobuf';

class MockMessage<T extends Message<T> = AnyMessage> extends Message<T> {
  static readonly runtime: typeof proto3;
  static readonly typeName = 'penumbra.view.v1.MockMessage';
  static readonly fields: FieldList;

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): MockMessage {
    bytes;
    options;
    return new MockMessage();
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): MockMessage {
    jsonValue;
    options;
    return new MockMessage();
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): MockMessage {
    jsonString;
    options;
    return new MockMessage();
  }

  static equals(
    a: MockMessage | PlainMessage<MockMessage> | undefined,
    b: MockMessage | PlainMessage<MockMessage> | undefined,
  ): boolean {
    a;
    b;
    return true;
  }
}

class FooRequest extends MockMessage<FooRequest> {}
class FooResponse extends MockMessage<FooResponse> {}
class BarRequest extends MockMessage<BarRequest> {}
class BarResponse extends MockMessage<BarResponse> {}

const MockService = {
  typeName: 'MockService',

  methods: {
    getFoos: {
      name: 'getFoos',
      I: FooRequest,
      O: FooResponse,
      kind: MethodKind.Unary,
    },

    getBars: {
      name: 'getBars',
      // Just supplying `I`/`O` to make TypeScript happy. The specific
      // `TransactionPlanner*` classes I've passed here aren't relevant to the
      // tests.
      I: BarRequest,
      O: BarResponse,
      kind: MethodKind.ServerStreaming,
    },
  },
} satisfies ServiceType;

const possiblyThrowError = vi.fn().mockImplementation(() => undefined);

const mockServiceImplementation = {
  getFoos: async () => {
    possiblyThrowError();

    return Promise.resolve(['foo1', 'foo2']);
  },

  getBars: async function* () {
    possiblyThrowError();

    const promises = [Promise.resolve('bar1'), Promise.resolve('bar2'), Promise.resolve('bar3')];

    for await (const i of promises) {
      yield i;
    }
  },
} satisfies ServiceImpl<typeof MockService>;

const mockHandlerContext = {} as HandlerContext;

const wrappedServiceImplementation = rethrowImplErrors(MockService, mockServiceImplementation);

describe('rethrowImplErrors()', () => {
  beforeEach(() => {
    possiblyThrowError.mockReset();
  });

  describe('for a unary method', () => {
    describe('when the request succeeds', () => {
      it('returns the response', async () => {
        await expect(
          wrappedServiceImplementation.getFoos(new FooRequest(), mockHandlerContext),
        ).resolves.toEqual(['foo1', 'foo2']);
      });
    });

    describe('when the impl throws a `ConnectError`', () => {
      it('throws the error as-is', async () => {
        const error = new ConnectError('oh no!');
        possiblyThrowError.mockImplementation(() => {
          throw error;
        });

        await expect(() =>
          wrappedServiceImplementation.getFoos(new FooRequest(), mockHandlerContext),
        ).rejects.toThrow(error);
      });
    });

    describe('when the impl throws an error that is not a `ConnectError`', () => {
      it('throws the error as a `ConnectError`', async () => {
        const error = new Error('oh no!');
        possiblyThrowError.mockImplementation(() => {
          throw error;
        });

        await expect(() =>
          wrappedServiceImplementation.getFoos(new FooRequest(), mockHandlerContext),
        ).rejects.toThrow(new ConnectError('oh no!'));
      });
    });
  });

  describe('for a streaming method', () => {
    describe('when the request succeeds', () => {
      it('yields the response', async () => {
        expect.assertions(3);

        let whichBar = 1;
        for await (const item of wrappedServiceImplementation.getBars(
          new BarRequest(),
          mockHandlerContext,
        )) {
          expect(item).toBe(`bar${whichBar}`);
          whichBar++;
        }
      });
    });

    describe('when the impl throws a `ConnectError`', () => {
      it('throws the error as-is', async () => {
        const error = new ConnectError('oh no!');
        possiblyThrowError.mockImplementation(() => {
          throw error;
        });

        await expect(async () => {
          for await (const item of wrappedServiceImplementation.getBars(
            new BarRequest(),
            mockHandlerContext,
          )) {
            // no-op
            item;
          }
        }).rejects.toThrow(error);
      });
    });

    describe('when the impl throws an error that is not a `ConnectError`', () => {
      it('throws the error as a `ConnectError`', async () => {
        const error = new Error('oh no!');
        possiblyThrowError.mockImplementation(() => {
          throw error;
        });

        await expect(async () => {
          for await (const item of wrappedServiceImplementation.getBars(
            new BarRequest(),
            mockHandlerContext,
          )) {
            // no-op
            item;
          }
        }).rejects.toThrow(new ConnectError('oh no!'));
      });
    });
  });
});
