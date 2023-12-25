import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { getAddressByIndex, TxPlanner } from '@penumbra-zone/wasm-ts';

import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';

export const transactionPlanner: Impl['transactionPlanner'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();
  const chainParams = await services.querier.app.chainParams();
  const fmdParams = await indexedDb.getFmdParams();
  if (!fmdParams) throw new Error('Fmd Params not in indexeddb');

  const planner = await TxPlanner.initialize({
    idbConstants: indexedDb.constants(),
    chainParams,
    fmdParams,
  });

  if (req.expiryHeight) planner.expiryHeight(req.expiryHeight);
  if (req.memo) planner.memo(req.memo);
  if (req.fee) planner.fee(req.fee);

  for (const { value, address } of req.outputs)
    if (value && address) planner.output(value, address);

  for (const withdrawal of req.ics20Withdrawals) planner.ics20Withdrawal(withdrawal);

  const source = req.source ?? new AddressIndex({ account: 0 });

  // If there are any balances left over, refund back to source. Default to account 0.
  const refundAddr = getAddressByIndex(fullViewingKey, source.account);

  const plan = await planner.plan(refundAddr, source);
  return { plan };
};
