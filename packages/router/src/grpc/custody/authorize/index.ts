import type { Impl } from '..';
import { extLocalCtx, extSessionCtx, servicesCtx } from '../../../ctx/prax';
import { approverCtx } from '../../../ctx/approver';
import { generateSpendKey } from '@penumbra-zone/wasm/src/keys';
import { authorizePlan } from '@penumbra-zone/wasm/src/build';
import { Key } from '@penumbra-zone/crypto-web/src/encryption';
import { Code, ConnectError } from '@connectrpc/connect';
import { Box } from '@penumbra-zone/types/src/box';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import { assertSwapClaimAddressesBelongToCurrentUser } from './assert-swap-claim-addresses-belong-to-current-user';
import { isControlledAddress } from '@penumbra-zone/wasm/src/address';
import { assertSwapAssetsAreNotTheSame } from './assert-swap-assets-are-not-the-same';

export const authorize: Impl['authorize'] = async (req, ctx) => {
  if (!req.plan) throw new ConnectError('No plan included in request', Code.InvalidArgument);

  const approveReq = ctx.values.get(approverCtx);
  const sess = ctx.values.get(extSessionCtx);
  const local = ctx.values.get(extLocalCtx);
  const walletServices = await ctx.values.get(servicesCtx).getWalletServices();

  const { fullViewingKey } = walletServices.viewServer;
  assertSwapClaimAddressesBelongToCurrentUser(req.plan, address =>
    isControlledAddress(fullViewingKey, address),
  );
  assertSwapAssetsAreNotTheSame(req.plan);

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
