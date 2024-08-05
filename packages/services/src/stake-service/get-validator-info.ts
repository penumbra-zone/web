import { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { Code, ConnectError } from '@connectrpc/connect';
import {
  GetValidatorInfoRequest,
  GetValidatorInfoResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';

export const getValidatorInfo: Impl['getValidatorInfo'] = async (req, ctx) => {
  if (!req.identityKey) {
    throw new ConnectError('Missing identityKey in request', Code.InvalidArgument);
  }
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();

  // Step 1: Try to find validator info in database
  const infoInDb = await indexedDb.getValidatorInfo(req.identityKey);
  if (infoInDb) {
    return new GetValidatorInfoResponse({ validatorInfo: infoInDb });
  }

  // Step 2: If none locally, query remote node
  const { validatorInfo: infoFromNode } = await querier.stake.validatorInfo(
    new GetValidatorInfoRequest({ identityKey: req.identityKey }),
  );
  if (infoFromNode) {
    return new GetValidatorInfoResponse({ validatorInfo: infoFromNode });
  }

  throw new ConnectError('No found validator info', Code.NotFound);
};
