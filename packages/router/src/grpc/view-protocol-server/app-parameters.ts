import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const appParameters: Impl['appParameters'] = async (_, ctx) => {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const parameters = await indexedDb.getAppParams();
  if (!parameters) throw new Error('App parameters not available');
  return { parameters };
};
