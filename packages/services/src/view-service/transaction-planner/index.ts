import type { Impl } from '..';
import { servicesCtx } from '../../ctx/prax';
import { planTransaction } from '@penumbra-zone/wasm/planner';
import { Code, ConnectError } from '@connectrpc/connect';
import { assertSwapAssetsAreNotTheSame } from './assert-swap-assets-are-not-the-same';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { fvkCtx } from '../../ctx/full-viewing-key';
import { extractAltFee } from '../fees';

export const transactionPlanner: Impl['transactionPlanner'] = async (req, ctx) => {
  assertValidRequest(req);

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  // Query IndexedDB directly to check for the existence of staking token
  const nativeToken = await indexedDb.hasStakingAssetBalance();

  // Initialize the gas fee token using the native staking token's asset ID
  // If there is no native token balance, extract and use an alternate gas fee token
  const gasFeeToken = nativeToken ? indexedDb.stakingTokenAssetId : extractAltFee(req);

  const fmdParams = await indexedDb.getFmdParams();
  if (!fmdParams) throw new ConnectError('FmdParameters not available', Code.FailedPrecondition);

  const { chainId, sctParams } = (await indexedDb.getAppParams()) ?? {};
  if (!sctParams) throw new ConnectError('SctParameters not available', Code.FailedPrecondition);
  if (!chainId) throw new ConnectError('ChainId not available', Code.FailedPrecondition);

  // Wasm planner needs the presence of gas prices in the db to work
  const gasPrices = await indexedDb.getGasPrices();
  if (!gasPrices) throw new ConnectError('Gas prices is not available', Code.FailedPrecondition);

  const idbConstants = indexedDb.constants();
  const fvk = await ctx.values.get(fvkCtx)();
  const plan = await planTransaction(idbConstants, req, fvk, gasFeeToken);

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
