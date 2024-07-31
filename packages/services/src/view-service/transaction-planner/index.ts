import type { Impl } from '../index.js';
import { servicesCtx } from '../../ctx/prax.js';
import { planTransaction } from '@penumbra-zone/wasm/planner';
import { Code, ConnectError } from '@connectrpc/connect';
import { assertSwapAssetsAreNotTheSame } from './assert-swap-assets-are-not-the-same.js';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { fvkCtx } from '../../ctx/full-viewing-key.js';
import { extractAltFee } from '../fees.js';
import { assertTransactionSource } from './assert-transaction-source.js';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { toPlainMessage } from '@bufbuild/protobuf';

export const transactionPlanner: Impl['transactionPlanner'] = async (req, ctx) => {
  assertValidRequest(req);

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const noNativeTokenAvailable = !(await indexedDb.accountHasSpendableAsset(
    toPlainMessage(req.source ?? new AddressIndex()),
    indexedDb.stakingTokenAssetId,
  ));

  const planningSwapClaim = req.swapClaims.length > 0;
  // Check if we should use the native token or extract an alternate gas fee token.
  // Special cased for swap claims as gas fee needs to match the claimFee on the corresponding swap.
  console.log('alt fee reasons', noNativeTokenAvailable, planningSwapClaim);

  const gasFeeToken =
    noNativeTokenAvailable || planningSwapClaim
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
  assertTransactionSource(req);
};
