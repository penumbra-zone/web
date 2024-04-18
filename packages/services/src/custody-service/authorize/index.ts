import type { Impl } from '..';
import { extLocalCtx, extSessionCtx } from '../../ctx/prax';
import { approverCtx } from '../../ctx/approver';
import { generateSpendKey } from '@penumbra-zone/wasm/src/keys';
import { authorizePlan } from '@penumbra-zone/wasm/src/build';
import { Key } from '@penumbra-zone/crypto-web/encryption';
import { Code, ConnectError, HandlerContext } from '@connectrpc/connect';
import { Box } from '@penumbra-zone/types/src/box';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import { assertSwapClaimAddressesBelongToCurrentUser } from './assert-swap-claim-addresses-belong-to-current-user';
import { isControlledAddress } from '@penumbra-zone/wasm/src/address';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { fvkCtx } from '../../ctx/full-viewing-key';

export const authorize: Impl['authorize'] = async (req, ctx) => {
  if (!req.plan) throw new ConnectError('No plan included in request', Code.InvalidArgument);

  assertValidRequest(req, ctx);

  const approveReq = ctx.values.get(approverCtx);
  const sess = ctx.values.get(extSessionCtx);
  const local = ctx.values.get(extLocalCtx);

  if (!approveReq) throw new ConnectError('Approver not found', Code.Unavailable);

  const passwordKey = await sess.get('passwordKey');
  if (!passwordKey) throw new ConnectError('User must login to extension', Code.Unauthenticated);

  const wallets = await local.get('wallets');
  const {
    custody: { encryptedSeedPhrase },
  } = wallets[0]!;

  const key = await Key.fromJson(passwordKey);
  const decryptedSeedPhrase = await key.unseal(Box.fromJson(encryptedSeedPhrase));

  if (!decryptedSeedPhrase)
    throw new ConnectError('Unable to decrypt seed phrase with password', Code.Unauthenticated);

  const choice = await approveReq(req);
  if (choice !== UserChoice.Approved)
    throw new ConnectError('Transaction was not approved', Code.PermissionDenied);

  const spendKey = generateSpendKey(decryptedSeedPhrase);
  const data = authorizePlan(spendKey, req.plan);

  return { data };
};

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
const assertValidRequest = (req: AuthorizeRequest, ctx: HandlerContext): void => {
  const fullViewingKey = ctx.values.get(fvkCtx);
  if (!fullViewingKey) {
    throw new ConnectError('Cannot access full viewing key', Code.Unauthenticated);
  }
  assertSwapClaimAddressesBelongToCurrentUser(req.plan!, address =>
    isControlledAddress(fullViewingKey, address),
  );
};
