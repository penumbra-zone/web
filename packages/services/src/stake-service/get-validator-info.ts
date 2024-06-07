import { Code, ConnectError } from '@connectrpc/connect';
import { Impl } from '.';
import { idbCtx } from '../ctx/prax';

export const getValidatorInfo: Impl['getValidatorInfo'] = async (req, ctx) => {
  if (!req.identityKey) {
    throw new ConnectError('Missing identityKey in request', Code.InvalidArgument);
  }

  const idb = await ctx.values.get(idbCtx)();

  const validatorInfo = await idb.getValidatorInfo(req.identityKey);

  if (!validatorInfo) {
    throw new ConnectError('No found validator info', Code.NotFound);
  }
  return { validatorInfo };
};
