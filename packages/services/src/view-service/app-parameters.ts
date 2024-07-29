import { AppParameters } from '@penumbra-zone/protobuf/types';
import type { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';

export const appParameters: Impl['appParameters'] = async (_, ctx) => {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const subscription = indexedDb.subscribe('APP_PARAMETERS');
  const parameters = await indexedDb.getAppParams();
  if (parameters) {
    return { parameters };
  }
  for await (const update of subscription) {
    return { parameters: AppParameters.fromJson(update.value) };
  }

  throw new Error('App parameters not available');
};
