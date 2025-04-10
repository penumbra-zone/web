import { Impl } from './index.js';
import { servicesCtx } from '../ctx/prax.js';
import { Code, ConnectError } from '@connectrpc/connect';
import {
  GetValidatorInfoRequest,
  ValidatorInfo,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';

export const validatorStatus: Impl['validatorStatus'] = async ({ identityKey }, ctx) => {
  if (!identityKey) {
    throw ConnectError.from('Validator identity key required', Code.InvalidArgument);
  }

  const services = await ctx.values.get(servicesCtx)();
  const { querier, indexedDb } = await services.getWalletServices();

  const remoteValidatorInfo = querier.stake
    .validatorInfo(new GetValidatorInfoRequest({ identityKey }))
    .then(({ validatorInfo }) => validatorInfo);

  const { status } = new ValidatorInfo(
    // try to get latest, but suppress request error
    (await remoteValidatorInfo.catch()) ??
      // if unavailable, use local info
      (await indexedDb.getValidatorInfo(identityKey)),
  );

  return { status };
};
