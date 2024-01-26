import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { grpcClient } from '../../../clients';

/**
 * Returns a Promise of a boolean indicating whether the given address is
 * controlled by the current user.
 *
 * Note that this is different from the `isControlledAddress` export from
 * `@penumbra-zone/wasm-ts`, which requires a full viewing key to be passed to
 * it. We don't have access to the full viewing key here inside the popup, so
 * we'll call to the gRPC client's `.indexByAddress()` method. That method
 * throws when the given address is not controlled by the user's full viewing
 * key. So we'll return `true` if it doesn't throw, and `false` if it does.
 *
 * @see packages/router/src/grpc/view-protocol-server/index-by-address.ts
 */
export const isControlledAddress = async (address: Address): Promise<boolean> => {
  try {
    await grpcClient.indexByAddress({ address });
    return true;
  } catch (e) {
    if (e instanceof ConnectError && e.code === Code.Unauthenticated) {
      return false;
    } else {
      throw e;
    }
  }
};
