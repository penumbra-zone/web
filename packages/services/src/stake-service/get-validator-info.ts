import { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { Code, ConnectError } from '@connectrpc/connect';

export const getValidatorInfo: Impl['getValidatorInfo'] = async (req, ctx) => {
  if (!req.identityKey) {
    throw new ConnectError('Missing identityKey in request', Code.InvalidArgument);
  }
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const validatorInfo = await indexedDb.getValidatorInfo(req.identityKey);

  if (!validatorInfo) {
    throw new ConnectError('No found validator info', Code.NotFound);
  }
  return { validatorInfo };
};
