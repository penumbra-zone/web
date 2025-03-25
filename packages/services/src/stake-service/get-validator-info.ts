import { Impl } from './index.js';
import { create } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { Code, ConnectError } from '@connectrpc/connect';
import {
  GetValidatorInfoRequestSchema,
  GetValidatorInfoResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';

export const getValidatorInfo: Impl['getValidatorInfo'] = async (req, ctx) => {
  if (!req.identityKey) {
    throw new ConnectError('Missing identityKey in request', Code.InvalidArgument);
  }
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();

  // Step 1: Try to find validator info in database
  const infoInDb = await indexedDb.getValidatorInfo(req.identityKey);
  if (infoInDb) {
    return create(GetValidatorInfoResponseSchema, { validatorInfo: infoInDb });
  }

  // Step 2: If none locally, query remote node
  const { validatorInfo: infoFromNode } = await querier.stake.validatorInfo(
    create(GetValidatorInfoRequestSchema, { identityKey: req.identityKey }),
  );
  if (infoFromNode) {
    return create(GetValidatorInfoResponseSchema, { validatorInfo: infoFromNode });
  }

  throw new ConnectError('No found validator info', Code.NotFound);
};
