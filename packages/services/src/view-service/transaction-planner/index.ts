import type { Impl } from '..';
import { servicesCtx } from '../../ctx/prax';
import { planTransaction } from '@penumbra-zone/wasm/planner';
import { Code, ConnectError } from '@connectrpc/connect';
import { assertSwapAssetsAreNotTheSame } from './assert-swap-assets-are-not-the-same';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { fvkCtx } from '../../ctx/full-viewing-key';
import { extractAltFee } from '../fees';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

export const transactionPlanner: Impl['transactionPlanner'] = async (req, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  // Retrieve the staking token from asset registry
  const stakingTokenId = indexedDb.fetchStakingTokenId();

  // Query IndexedDB directly to check for the existence of staking token
  const nativeToken = await indexedDb.hasStakingAssetBalance(stakingTokenId);

  // Initialize the gas fee token using an native staking token's asset ID
  let gasFeeToken = new AssetId({
    inner: stakingTokenId.inner,
  });

  // If there is no native token balance, extract and use an alternate gas fee token
  if (!nativeToken) {
    gasFeeToken = extractAltFee(req)!;
  }

  const fvk = ctx.values.get(fvkCtx);

  assertValidRequest(req);

  const fmdParams = await indexedDb.getFmdParams();
  if (!fmdParams) throw new ConnectError('FmdParameters not available', Code.FailedPrecondition);
  const { chainId, sctParams } = (await indexedDb.getAppParams()) ?? {};
  if (!sctParams) throw new ConnectError('SctParameters not available', Code.FailedPrecondition);
  if (!chainId) throw new ConnectError('ChainId not available', Code.FailedPrecondition);
  const gasPrices = await indexedDb.getGasPrices();
  if (!gasPrices) throw new ConnectError('Gas prices is not available', Code.FailedPrecondition);

  const idbConstants = indexedDb.constants();

  const plan: TransactionPlan = await planTransaction(idbConstants, req, await fvk(), gasFeeToken);

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
