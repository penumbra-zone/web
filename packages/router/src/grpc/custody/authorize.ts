import type { Impl } from '.';
import { approverCtx, extLocalCtx, extSessionCtx } from '../../ctx';

import { authorizePlan, generateSpendKey } from '@penumbra-zone/wasm-ts';

import { Key } from '@penumbra-zone/crypto-web';
import { Box } from '@penumbra-zone/types';

export const authorize: Impl['authorize'] = async (req, ctx) => {
  if (!req.plan) throw new Error('No plan included in request');

  const approveReq = ctx.values.get(approverCtx);
  await approveReq(req);

  const sess = ctx.values.get(extSessionCtx);
  const local = ctx.values.get(extLocalCtx);

  const passwordKey = await sess.get('passwordKey');
  if (!passwordKey) throw new Error('User must login to extension');

  const wallets = await local.get('wallets');
  const { encryptedSeedPhrase } = wallets[0]!.custody;

  const key = await Key.fromJson(passwordKey);
  const decryptedSeedPhrase = await key.unseal(Box.fromJson(encryptedSeedPhrase));
  if (!decryptedSeedPhrase) throw new Error('Unable to decrypt seed phrase with password');

  const spendKey = generateSpendKey(decryptedSeedPhrase);

  return { data: authorizePlan(spendKey, req.plan) };
};
