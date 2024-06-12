import { Impl } from '.';

import { Code, ConnectError } from '@connectrpc/connect';
import { dbCtx } from '../ctx/database';

export const getValidatorInfo: Impl['getValidatorInfo'] = async (req, ctx) => {
  if (!req.identityKey) {
    throw new ConnectError('Missing identityKey in request', Code.InvalidArgument);
  }
  const indexedDb = await ctx.values.get(dbCtx)();

  const validatorInfo = await indexedDb.getValidatorInfo(req.identityKey);

  if (!validatorInfo) {
    throw new ConnectError('No found validator info', Code.NotFound);
  }
  return { validatorInfo };
};
