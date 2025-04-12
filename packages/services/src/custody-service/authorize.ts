import type { Impl } from './index.js';
import { Code, ConnectError } from '@connectrpc/connect';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import { authorizeCtx } from '../ctx/authorize.js';
import { assertValidActionPlans } from './util/validate-request.js';
import { assertNonzeroSignature, assertNonzeroEffect } from './util/validate-response.js';

/**
 * This is essentially a configurable stub. It performs some basic validation,
 * and then trusts the service context to provide an appropriate implementation.
 */
export const authorize: Impl['authorize'] = async (req, ctx) => {
  if (!req.plan) {
    throw new ConnectError('No plan included in request', Code.InvalidArgument);
  }

  const fvk = await ctx.values.get(fvkCtx)();
  assertValidActionPlans(fvk, req.plan.actions);

  const res = await ctx.values.get(authorizeCtx)(req);
  assertNonzeroEffect(res.data?.effectHash);
  assertNonzeroSignature(res.data);

  return res;
};
