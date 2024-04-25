import { assertSwapClaimAddressesBelongToCurrentUser } from './assert-swap-claim-addresses-belong-to-current-user';
import { isControlledAddress } from '@penumbra-zone/wasm/address';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

/**
 * Makes a series of assertions that ensure the validity of the request,
 * throwing an error if any of them fail.
 *
 * Assertions should be related to _security_ -- that is, this is the place to
 * catch issues with the transaction that have security implications if left
 * uncaught. For example, this is where to ensure that a swap transaction's
 * claim address actually belongs to the current user. (If such an assertion
 * were placed in e.g., the `transactionPlanner` implementation, malicious
 * websites could get around it by planning the transaction themselves, rather
 * than calling the `transactionPlanner` method. But there is no way for
 * malicious websites to avoid calling `authorize`, so putting the assertion
 * here is an absolute roadblock to such behavior.)
 *
 * Add more assertions to this function as needed.
 */
export const assertValidAuthorizeRequest = (req: AuthorizeRequest, fvk: FullViewingKey): void =>
  assertSwapClaimAddressesBelongToCurrentUser(req.plan!, address =>
    isControlledAddress(fvk, address),
  );
