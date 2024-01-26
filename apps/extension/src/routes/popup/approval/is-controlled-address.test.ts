import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { HandlerContext } from '@connectrpc/connect';
import { indexByAddress } from '@penumbra-zone/router/src/grpc/view-protocol-server/index-by-address';
import { IndexByAddressRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { isControlledAddress } from './is-controlled-address';

const mockFvk = vi.hoisted(
  () =>
    'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
);

const mockContext = vi.hoisted(() => ({
  values: {
    get: () => ({
      getWalletServices: () => ({
        viewServer: {
          fullViewingKey: mockFvk,
        },
      }),
    }),
  },
}));

/**
 * Instead of mocking `grpcClient.indexByAddress` (via, e.g., `vi.spyOn()`), we
 * will use the underlying implementation and just mock the context passed to
 * it. That's because `indexByAddress` throws when it can't find an index, and
 * TypeScript doesn't know about error types. So we want to make sure that, if
 * the underlying implementation changes, these tests will break, and we'll know
 * to update the logic of `isControlledAddress()`.
 */
vi.mock('../../../clients', () => ({
  grpcClient: {
    indexByAddress: (req: IndexByAddressRequest) =>
      indexByAddress(req, mockContext as unknown as HandlerContext),
  },
}));

/**
 * Note that we're mocking the `isControlledAddress` export from
 * `@penumbra-zone/wasm-ts`, which is used under the hood by
 * `grpcClient.indexByAddress`. We're _not_ mocking the `isControlledAddress`
 * function that we're testing, obviously.
 */
const mockIsControlledAddress = vi.hoisted(() => vi.fn());
vi.mock('@penumbra-zone/wasm-ts', () => ({
  isControlledAddress: mockIsControlledAddress,
}));

describe('isControlledAddress()', () => {
  beforeEach(() => {
    mockIsControlledAddress.mockReset();
  });

  describe('when the call to `grpcClient.indexByAddress` does not throw', () => {
    beforeEach(() => {
      mockIsControlledAddress.mockImplementation(() => new AddressIndex({ account: 0 }));
    });

    test('resolves to `true`', async () => {
      await expect(isControlledAddress(new Address())).resolves.toBe(true);
    });
  });

  describe('when the call to `grpcClient.indexByAddress` throws', () => {
    describe('when the error is a `ConnectError` with `Code.Unauthenticated`', () => {
      beforeEach(() => {
        mockIsControlledAddress.mockImplementation(() => undefined);
      });

      test('resolves to `false`', async () => {
        await expect(isControlledAddress(new Address())).resolves.toBe(false);
      });
    });

    describe('when the error is not a `ConnectError` with `Code.Unauthenticated`', () => {
      beforeEach(() => {
        mockIsControlledAddress.mockImplementation(() => {
          throw new Error('oops');
        });
      });

      test('rethrows the error', async () => {
        await expect(isControlledAddress(new Address())).rejects.toThrow('oops');
      });
    });
  });
});
