import { authorizeCtx } from '../ctx/authorize.js';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import type { Impl } from './index.js';
import { assertValidActionPlans } from './util/validate-request.js';
import { assertValidAuthorizationData } from './util/validate-response.js';
import { toPlainMessage } from '@bufbuild/protobuf';

/**
 * This is essentially a configurable stub. It performs some basic validation,
 * and then trusts the service context to provide an appropriate implementation.
 */
export const authorize: Impl['authorize'] = async ({ plan, preAuthorizations }, ctx) => {
  const fvk = await ctx.values.get(fvkCtx)();

  const actionCounts = assertValidActionPlans(fvk, plan && toPlainMessage(plan).actions);

  const { data: authorizationData } = await ctx.values.get(authorizeCtx)(
    { plan, preAuthorizations },
    ctx.signal,
  );

  return {
    data: assertValidAuthorizationData(actionCounts, authorizationData),
  };
};
