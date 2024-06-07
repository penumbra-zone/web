import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { planTransaction } from '@penumbra-zone/wasm/planner';
import type { Impl } from '..';
import { fvkCtx } from '../../ctx/full-viewing-key';
import { idbCtx } from '../../ctx/prax';
import { assertSwapAssetsAreNotTheSame } from './assert-swap-assets-are-not-the-same';

export const transactionPlanner: Impl['transactionPlanner'] = async (req, ctx) => {
  const idb = await ctx.values.get(idbCtx)();

  const fvk = ctx.values.get(fvkCtx);

  assertValidRequest(req);

  const fmdParams = await idb.getFmdParams();
  if (!fmdParams) throw new ConnectError('FmdParameters not available', Code.FailedPrecondition);
  const { chainId, sctParams } = (await idb.getAppParams()) ?? {};
  if (!sctParams) throw new ConnectError('SctParameters not available', Code.FailedPrecondition);
  if (!chainId) throw new ConnectError('ChainId not available', Code.FailedPrecondition);
  const gasPrices = await idb.getGasPrices();
  if (!gasPrices) throw new ConnectError('Gas prices is not available', Code.FailedPrecondition);

  const plan = await planTransaction(idb.constants(), req, await fvk());
  return { plan };
};

/**
 * Makes a series of assertions that ensure the validity of the request,
 * throwing an error if any of them fail.
 *
 * Add more assertions to this function as needed.
 *
 * NOTE: Assertions related to security should NOT be run here, but rather in
 * the `CustodyService#authorize` implementation. That's because websites don't
 * actually have to call `ViewService#transactionPlanner`:
 * `ViewService#transactionPlanner` is just a convenience method for web apps
 * that don't want to build the transaction plan themselves. But a malicious
 * website could skip this step, build a transaction plan themselves, and submit
 * it for authorization. Thus, it is at the authorization stage we should catch
 * those issues, since there is no way to avoid that stage.
 */
const assertValidRequest = (req: TransactionPlannerRequest): void => {
  assertSwapAssetsAreNotTheSame(req);
};
