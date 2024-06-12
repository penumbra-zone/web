import type { Impl } from '.';

import { Code, ConnectError } from '@connectrpc/connect';
import { dbCtx } from '../ctx/database';

export const fMDParameters: Impl['fMDParameters'] = async (_, ctx) => {
  const indexedDb = await ctx.values.get(dbCtx)();
  const parameters = await indexedDb.getFmdParams();
  if (!parameters) throw new ConnectError('No FMD parameters', Code.FailedPrecondition);
  return { parameters };
};
