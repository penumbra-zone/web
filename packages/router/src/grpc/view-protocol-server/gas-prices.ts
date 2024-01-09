import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const gasPrices: Impl['gasPrices'] = async (_, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const gasPrices = await indexedDb.getGasPrices();
  if (!gasPrices) throw new Error('Gas prices is not available');

  return {
    gasPrices,
  };
};
