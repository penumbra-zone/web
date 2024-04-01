import type { Impl } from '..';
import { servicesCtx } from '../../../ctx/prax';
import { planTransaction } from '@penumbra-zone/wasm/src/planner';
import { Code, ConnectError, HandlerContext } from '@connectrpc/connect';
import { assertSwapClaimAddressesBelongToCurrentUser } from './assert-swap-claim-addresses-belong-to-current-user';
import { assertSwapAssetsAreNotTheSame } from './assert-swap-assets-are-not-the-same';
import { isControlledAddress } from '@penumbra-zone/wasm/src/address';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const transactionPlanner: Impl['transactionPlanner'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  await assertValidRequest(req, ctx);

  const fmdParams = await indexedDb.getFmdParams();
  if (!fmdParams) throw new ConnectError('FmdParameters not available', Code.FailedPrecondition);
  const { chainId, sctParams } = (await indexedDb.getAppParams()) ?? {};
  if (!sctParams) throw new ConnectError('SctParameters not available', Code.FailedPrecondition);
  if (!chainId) throw new ConnectError('ChainId not available', Code.FailedPrecondition);
  const gasPrices = await indexedDb.getGasPrices();
  if (!gasPrices) throw new ConnectError('Gas prices is not available', Code.FailedPrecondition);

  const idbConstants = indexedDb.constants();

  const plan = await planTransaction(idbConstants, req, fullViewingKey);
  return { plan };
};

/**
 * Makes a series of assertions that ensure the validity of the request,
 * throwing an error if any of them fail.
 *
 * Add more assertions to this function as needed.
 */
const assertValidRequest = async (
  req: TransactionPlannerRequest,
  ctx: HandlerContext,
): Promise<void> => {
  const services = ctx.values.get(servicesCtx);
  const {
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  assertSwapClaimAddressesBelongToCurrentUser(req, address =>
    isControlledAddress(fullViewingKey, address),
  );
  assertSwapAssetsAreNotTheSame(req);
};
