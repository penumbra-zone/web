import type { Impl } from '.';

import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import { dbCtx } from '../ctx/database';

export const appParameters: Impl['appParameters'] = async (_, ctx) => {
  const indexedDb = await ctx.values.get(dbCtx)();

  const subscription = indexedDb.subscribe('APP_PARAMETERS');
  const parameters = await indexedDb.getAppParams();
  if (parameters) return { parameters };
  for await (const update of subscription)
    return { parameters: AppParameters.fromJson(update.value) };

  throw new Error('App parameters not available');
};
