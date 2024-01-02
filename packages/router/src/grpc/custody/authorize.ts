import type { Impl } from '.';
import { approverCtx, extLocalCtx, extSessionCtx } from '../../ctx';

import * as wasm from '@penumbra-zone/wasm-ts';

import { Key } from '@penumbra-zone/crypto-web';
import { Box } from '@penumbra-zone/types';

import { ConnectError, Code } from '@connectrpc/connect';

export const authorize: Impl['authorize'] = async (req, ctx) => {
  if (!req.plan) throw new ConnectError('No plan included in request', Code.InvalidArgument);

  const approveReq = ctx.values.get(approverCtx);
  await approveReq(req);

  const sess = ctx.values.get(extSessionCtx);
  const local = ctx.values.get(extLocalCtx);

  const passwordKey = await sess.get('passwordKey');
  if (!passwordKey) throw new ConnectError('User must login to extension', Code.Unavailable);

  const wallets = await local.get('wallets');
  const { encryptedSeedPhrase } = wallets[0]!.custody;

  const key = await Key.fromJson(passwordKey);
  const decryptedSeedPhrase = await key.unseal(Box.fromJson(encryptedSeedPhrase));
  if (!decryptedSeedPhrase)
    throw new ConnectError('Unable to decrypt seed phrase with password', Code.Unauthenticated);

  let spendKey;
  try {
    spendKey = wasm.generateSpendKey(decryptedSeedPhrase);
  } catch (wasmErr) {
    throw new ConnectError('WASM failed to generate spend key', Code.Internal);
  }

  let data;
  try {
    data = wasm.authorizePlan(spendKey, req.plan);
  } catch (wasmErr) {
    throw new ConnectError('WASM failed to authorize plan', Code.Internal);
  }

  return { data };
};
