import type { Impl } from '.';

import { dbCtx } from '../ctx/database';

export const appParameters: Impl['appParameters'] = async (_, ctx) => {
  const indexedDb = await ctx.values.get(dbCtx)();

  const parameters = await indexedDb.getAppParams();
  if (parameters) return { parameters };

  throw new Error('App parameters not available');
};
