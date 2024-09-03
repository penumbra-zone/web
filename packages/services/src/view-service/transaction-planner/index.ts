import type { Impl } from '../index.js';
import { servicesCtx } from '../../ctx/prax.js';
import { planTransaction } from '@penumbra-zone/wasm/planner';
import { Code, ConnectError } from '@connectrpc/connect';
import { assertSwapAssetsAreNotTheSame } from './assert-swap-assets-are-not-the-same.js';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { fvkCtx } from '../../ctx/full-viewing-key.js';
import { extractAltFee } from '../fees.js';
import { assertTransactionSource } from './assert-transaction-source.js';
import { TransactionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { assertSpendMax } from './assert-max-spends.js';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const transactionPlanner: Impl['transactionPlanner'] = async (req, ctx) => {
  // Pre-checks before the transaction planning process begins.
  // This ensures that the initial transaction planner request is valid.
  assertValidRequest(req);

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  // Query IndexedDB directly to check for the existence of staking token
  const nativeToken = await indexedDb.hasTokenBalance(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify non-null assertion
    req.source!.account,
    indexedDb.stakingTokenAssetId,
  );

  // Check if we should use the native token or extract an alternate gas fee token.
  // Special cased for swap claims as gas fee needs to match the claimFee on the corresponding swap.
  const needsAltFeeToken = !nativeToken || req.swapClaims.length > 0;
  const gasFeeToken = needsAltFeeToken
    ? await extractAltFee(req, indexedDb)
    : indexedDb.stakingTokenAssetId;

  const fmdParams = await indexedDb.getFmdParams();
  if (!fmdParams) {
    throw new ConnectError('FmdParameters not available', Code.FailedPrecondition);
  }

  const { chainId, sctParams } = (await indexedDb.getAppParams()) ?? {};
  if (!sctParams) {
    throw new ConnectError('SctParameters not available', Code.FailedPrecondition);
  }
  if (!chainId) {
    throw new ConnectError('ChainId not available', Code.FailedPrecondition);
  }

  // Wasm planner needs the presence of gas prices in the db to work
  const gasPrices = await indexedDb.getNativeGasPrices();
  if (!gasPrices) {
    throw new ConnectError('Gas prices is not available', Code.FailedPrecondition);
  }

  const idbConstants = indexedDb.constants();
  const fvk = await ctx.values.get(fvkCtx)();
  const plan = await planTransaction(idbConstants, req, fvk, gasFeeToken);

  // Post-checks after the transaction plan is fully formed, providing an extra layer of validation
  // to ensure the plan adheres to all necessary rules.
  assertValidPlan(req, plan, indexedDb.stakingTokenAssetId);

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
  assertTransactionSource(req);
};

const assertValidPlan = (
  req: TransactionPlannerRequest,
  plan: TransactionPlan,
  stakingToken: AssetId,
): void => {
  // Perform additional checks specifically focused on ensuring that
  // transactions intending to spend the maximum amount are valid.
  assertSpendMax(req, plan, stakingToken);
};
