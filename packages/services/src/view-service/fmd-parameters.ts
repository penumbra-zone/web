import type { Impl } from '.';
import { idbCtx } from '../ctx/prax';

import { Code, ConnectError } from '@connectrpc/connect';

export const fMDParameters: Impl['fMDParameters'] = async (_, ctx) => {
  const idb = await ctx.values.get(idbCtx)();
  const parameters = await idb.getFmdParams();
  if (!parameters) throw new ConnectError('No FMD parameters', Code.FailedPrecondition);
  return { parameters };
};
