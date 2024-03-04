import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { planTransaction } from '@penumbra-zone/wasm';

export const transactionPlanner: Impl['transactionPlanner'] = async (req, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const {
    indexedDb,
    viewServer: { fullViewingKey },
  } = await services.getWalletServices();

  const idbConstants = indexedDb.constants();

  const plan = await planTransaction(idbConstants, req, fullViewingKey);
  return { plan };
};
