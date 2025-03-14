import { AppParametersSchema } from '@penumbra-zone/protobuf/penumbra/core/app/v1/app_pb';
import { create } from '@bufbuild/protobuf';
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
  // eslint-disable-next-line no-unreachable-loop -- TODO: justify
  for await (const update of subscription) {
    return { parameters: create(AppParametersSchema, update.value) };
  }

  throw new Error('App parameters not available');
};
