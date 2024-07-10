import type { Impl } from './index.js';
import { approverCtx } from '../ctx/approver.js';
import { authorizePlan } from '@penumbra-zone/wasm/build';
import { Code, ConnectError } from '@connectrpc/connect';
import { UserChoice } from '@penumbra-zone/types/user-choice';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import { skCtx } from '../ctx/spend-key.js';
import { assertValidAuthorizeRequest } from './validation/authorize.js';

export const authorize: Impl['authorize'] = async (req, ctx) => {
  if (!req.plan) {
    throw new ConnectError('No plan included in request', Code.InvalidArgument);
  }

  const fullViewingKey = await ctx.values.get(fvkCtx)();
  assertValidAuthorizeRequest(req, fullViewingKey);

  const choice = await ctx.values.get(approverCtx)(req);
  if (choice !== UserChoice.Approved) {
    throw new ConnectError('Transaction was not approved', Code.PermissionDenied);
  }

  const spendKey = await ctx.values.get(skCtx)();

  const data = authorizePlan(spendKey, req.plan);
  return { data };
};
