import type { Impl } from '.';

import { Code, ConnectError } from '@connectrpc/connect';
import { authorizePlan } from '@penumbra-zone/wasm/build';
import { UserChoice, approverCtx } from '../ctx/approver';
import { fvkCtx } from '../ctx/full-viewing-key';
import { skCtx } from '../ctx/spend-key';
import { assertValidAuthorizeRequest } from './validation/authorize';

export const authorize: Impl['authorize'] = async (req, ctx) => {
  if (!req.plan) throw new ConnectError('No plan included in request', Code.InvalidArgument);

  const fullViewingKey = await ctx.values.get(fvkCtx)();
  assertValidAuthorizeRequest(req, fullViewingKey);

  const choice = await ctx.values.get(approverCtx)(req);
  if (choice !== UserChoice.Approved)
    throw new ConnectError('Transaction was not approved', Code.PermissionDenied);

  const spendKey = await ctx.values.get(skCtx)();

  const data = authorizePlan(spendKey, req.plan);
  return { data };
};
